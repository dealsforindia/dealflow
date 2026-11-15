import os
import re
from bs4 import BeautifulSoup

html_path = r'nis-graphics-frame\rooftop.html'
with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

soup = BeautifulSoup(html, 'html.parser')

print('=== 1. JS SELECTOR VERIFICATION ===')
js_ids = set(re.findall(r"document\.getElementById\(['\"]([^'\"]+)['\"]\)", html))
dom_ids = set(tag['id'] for tag in soup.find_all(id=True))
missing_ids = js_ids - dom_ids
print(f'Total JS getElementById calls: {len(js_ids)}')
print(f'Missing DOM IDs: {missing_ids}')

# querySelector IDs
qs_ids = set(re.findall(r"querySelector\(['\"]#([^'\"]+)['\"]\)", html))
missing_qs = qs_ids - dom_ids
print(f'Missing querySelector IDs: {missing_qs}')

print('\n=== 2. ANCHOR LINKS VERIFICATION ===')
anchors = [a['href'] for a in soup.find_all('a', href=True) if a['href'].startswith('#')]
missing_targets = [a for a in anchors if a[1:] not in dom_ids]
print(f'Internal anchors: {anchors}')
print(f'Broken anchor targets: {missing_targets}')

print('\n=== 3. ASSET PATH VERIFICATION ===')
asset_dir = r'nis-graphics-frame'
srcs = re.findall(r"""(?:src|href)=['"]([^'"]+)['"]""", html)
broken_assets = []
for s in srcs:
    if s.startswith(('http', '#', 'tel:', 'mailto:')):
        continue
    full_path = os.path.join(asset_dir, s.replace('/', os.sep))
    exists = os.path.exists(full_path)
    if not exists:
        broken_assets.append((s, full_path))
print(f'Referenced relative assets count: {len([s for s in srcs if not s.startswith(("http", "#", "tel:", "mailto:"))])}')
print(f'Broken/Missing local assets: {broken_assets}')

# Check assets referenced in JS
js_assets = re.findall(r"""['"](assets/[^'"]+)['"]""", html)
for ja in js_assets:
    fp = os.path.join(asset_dir, ja.replace('/', os.sep))
    if not os.path.exists(fp):
        print(f'Missing JS asset: {ja}')

print('\n=== 4. ACCESSIBILITY AUDIT ===')
# Buttons
buttons = soup.find_all('button')
for b in buttons:
    text = b.get_text(strip=True)
    aria_label = b.get('aria-label')
    title = b.get('title')
    b_type = b.get('type')
    if not text and not aria_label and not title:
        print(f'Accessibility issue: Button has no text or label: {b}')
    if not b_type:
        print(f'Form issue: Button missing type attribute (defaults to submit): {b.get("id") or b.get("class") or text}')

# Images without alt
imgs = soup.find_all('img')
for img in imgs:
    alt = img.get('alt')
    src = img.get('src')
    if alt is None:
        print(f'Accessibility issue: Image missing alt attribute: {src}')
    elif alt == '':
        print(f'Empty alt (decorative or incomplete): {src}')

print('\n=== 5. PERFORMANCE & VERCEL READINESS ===')
# Meta tags
meta_desc = soup.find('meta', attrs={'name': 'description'})
print(f'Meta description present: {meta_desc is not None}')
og_tags = soup.find_all('meta', attrs={'property': re.compile(r'^og:')})
print(f'OpenGraph tags count: {len(og_tags)}')
twitter_tags = soup.find_all('meta', attrs={'name': re.compile(r'^twitter:')})
print(f'Twitter card tags count: {len(twitter_tags)}')
canonical = soup.find('link', attrs={'rel': 'canonical'})
print(f'Canonical link present: {canonical is not None}')
favicon = soup.find('link', attrs={'rel': re.compile(r'icon')})
print(f'Favicon link present: {favicon is not None}')

print('\n=== 6. JAVASCRIPT SYNTAX & RUNTIME RISKS ===')
scripts = soup.find_all('script')
for s in scripts:
    content = s.string or ''
    # Check for potential runtime issues
    if 'localStorage' in content:
        print('localStorage usage found - check for private mode / quota / SSR exceptions')
    if 'AudioContext' in content:
        print('Web Audio API found - check for browser autoplay policy suspensions')
    if 'IntersectionObserver' in content:
        print('IntersectionObserver found - check for polyfill / element bounding rects')
