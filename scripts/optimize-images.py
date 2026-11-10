# Converts the downloaded originals (scripts/.image-originals/<cdn>.jpg) into the
# optimized WebP files listed in src/data/creditos-imagens.json.
# Page images: one 1600px file. Product images: <name>-lg.webp (1400px) + <name>-sm.webp (720px).
# Usage (from the project root): python scripts/optimize-images.py
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ORIGINALS = ROOT / 'scripts' / '.image-originals'
data = json.loads((ROOT / 'src' / 'data' / 'creditos-imagens.json').read_text(encoding='utf-8'))


def save(im, dest, width, quality=78):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, 'WEBP', quality=quality, method=6)
    return dest.stat().st_size // 1024


total = 0
for item in data['imagens']:
    src = ORIGINALS / f"{item['cdn']}.jpg"
    im = Image.open(src).convert('RGB')
    target = ROOT / 'public' / item['arquivo'].lstrip('/')
    if item['arquivo'].endswith('.webp'):
        kb = save(im, target, 1600)
        total += kb
        print(f"{item['uso']}: {kb} KB")
    else:
        lg = save(im, target.with_name(target.name + '-lg.webp'), 1400)
        sm = save(im, target.with_name(target.name + '-sm.webp'), 720, quality=74)
        total += lg + sm
        print(f"{item['uso']}: lg {lg} KB, sm {sm} KB")
print('total', total, 'KB')
