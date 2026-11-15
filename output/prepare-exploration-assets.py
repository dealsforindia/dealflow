import json
from pathlib import Path
from PIL import Image

root = Path(__file__).parent
out = root / 'ui-exploration' / 'assets'
out.mkdir(parents=True, exist_ok=True)
bundle = json.loads((root / 'ui-exploration-assets.json').read_text())
mapping = {}
for i, asset in enumerate(bundle['assets']):
    target = out / f'product-{i}.png'
    Image.open(asset['path']).convert('RGBA').save(target)
    mapping[asset['url']] = 'assets/' + target.name
(out.parent / 'asset-map.json').write_text(json.dumps(mapping, indent=2))
