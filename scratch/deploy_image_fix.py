"""Stage minimal image patches against current VM files, with backups and syntax validation."""
from pathlib import Path
import subprocess
import datetime
import json

ROOT = Path(__file__).resolve().parents[1]
SSH = ['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=5', '-o', 'StrictHostKeyChecking=yes', 'rudranil777@74.225.250.0']
REMOTE = '/home/rudranil777/dealbot'
stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
stage = f'{REMOTE}/image-fix-{stamp}'

def remote(command, data=None):
    result = subprocess.run(SSH + [command], input=data, capture_output=True, timeout=60)
    if result.returncode:
        raise RuntimeError(result.stderr.decode(errors='replace')[:600])
    return result.stdout

reader = "import json; from pathlib import Path; root=Path('/home/rudranil777/dealbot'); print(json.dumps({name:(root/name).read_text() for name in ('api.py','store_scraper.py','public_price_evidence.py','desidime_bot.py')}))"
files = json.loads(remote('python3 -', reader.encode()))

text = files['store_scraper.py']
if 'from amazon_images import extract_amazon_image' not in text:
    start = text.index('    # 6. High-res Product Image')
    end = text.index('    # Brand', start)
    text = text[:start] + '    # Match the primary product ASIN before selecting its Amazon CDN image.\n    from amazon_images import extract_amazon_image\n    res["image_url"] = extract_amazon_image(html, url)\n\n' + text[end:]
files['store_scraper.py'] = text

text = files['public_price_evidence.py']
if 'from amazon_images import extract_amazon_image' not in text:
    old = '            image = soup.select_one(\'#landingImage\')\n            quote["image"] = (image.get(\'data-old-hires\') or image.get(\'src\')) if image else None'
    assert old in text, 'Price extraction anchor changed; refusing broad replacement'
    text = text.replace(old, '            from amazon_images import extract_amazon_image\n            quote["image"] = extract_amazon_image(html, url)', 1)
    text = text.replace('    if quote["price"]:\n', '    if expected.startswith("amazon:"):\n        from amazon_images import extract_amazon_image\n        quote["image"] = extract_amazon_image(html, url)\n    if quote["price"]:\n', 1)
files['public_price_evidence.py'] = text

text = files['api.py']
old = '        img = d.get("uploaded_img_url") or d.get("img_url")'
if 'merchant_image = amazon_cdn_image' not in text:
    assert old in text, 'Feed image selection anchor changed'
    text = text.replace(old, '        from amazon_images import amazon_asin, amazon_cdn_image\n        merchant_image = amazon_cdn_image(d.get("store_img_url")) if amazon_asin(raw_merchant_url) else None\n        img = d.get("uploaded_img_url") or merchant_image or d.get("img_url")', 1)
files['api.py'] = text

text = files['desidime_bot.py']
if 'direct_amazon_image = ' not in text:
    old = '                if store_details.get("image_url") and not img_path:'
    assert old in text, 'DesiDime image selection anchor changed'
    text = text.replace(old, '                from amazon_images import amazon_asin, amazon_cdn_image\n                direct_amazon_image = amazon_cdn_image(store_details.get("image_url")) if amazon_asin(target_scrape_url) else None\n                if store_details.get("image_url") and (not img_path or direct_amazon_image):', 1)
    text = text.replace('        # Direct Store Ground Truth Scraping: Fetch authentic merchant details', '        store_details = {}\n        # Direct Store Ground Truth Scraping: Fetch authentic merchant details', 1)
    line = next(line for line in text.splitlines() if line.startswith('        img_url_web = '))
    text = text.replace(line, line + '\n        if target_scrape_url:\n            from amazon_images import amazon_asin, amazon_cdn_image\n            if amazon_asin(target_scrape_url) and amazon_cdn_image(store_details.get("image_url")):\n                img_url_web = store_details["image_url"]', 1)
files['desidime_bot.py'] = text

for name in ('amazon_images.py', 'backfill_amazon_images.py'):
    files[name] = (ROOT / 'dealbot_backend' / 'dealbot' / name).read_text(encoding='utf-8')
for name, text in files.items():
    compile(text, name, 'exec')
writer = f'''import json, shutil, py_compile, subprocess
from pathlib import Path
root = Path({REMOTE!r}); stage = Path({stage!r})
files = json.loads({json.dumps(files)!r})
(stage/'original').mkdir(parents=True); (stage/'candidate').mkdir()
for name, text in files.items():
    candidate = stage/'candidate'/name
    candidate.write_text(text)
    py_compile.compile(str(candidate), doraise=True)
    if (root/name).exists(): shutil.copy2(root/name, stage/'original'/name)
for name in files: shutil.copy2(stage/'candidate'/name, root/name)
print(json.dumps({{'backup': str(stage/'original'), 'files': list(files)}}))
subprocess.run(['pm2','restart','api','desidime','worker','price-scanner'], check=True)
'''
print(remote('python3 -', writer.encode()).decode('utf-8', errors='replace'))
