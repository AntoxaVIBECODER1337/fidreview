"""Рендер «студийных» изображений товаров: объёмная иллюстрация (Noto Color Emoji)
на фоне-циклораме с тенью. Фон подкрашивается по цвету варианта товара
или по категории. Результат: public/img/products/<id>.webp (800×600)."""
import io, json, sys, time
from pathlib import Path
from PIL import Image, ImageOps
from playwright.sync_api import sync_playwright

ROOT = Path(sys.argv[1])
ONLY = set(sys.argv[2:])
OUT = ROOT / 'public/img/products'
OUT.mkdir(parents=True, exist_ok=True)
products = json.load(open(ROOT / 'src/data/products.json'))

# Тон фона по категории: (светлый, тёмный)
CAT = {
    'interier': ('#f3ede4', '#d9cbb6'), 'stroymaterialy': ('#eef0f2', '#c9ced6'), 'instrument': ('#eaf1fb', '#bcd0ec'),
    'santehnika': ('#e9f4fb', '#b7d9ee'), 'electrika': ('#fdf6e3', '#efd99b'), 'krepesh': ('#eef0f3', '#c7ccd4'),
    'blagoustroystvo': ('#ecf6ea', '#bfdcb7'), 'mebel': ('#f5eee7', '#dcc7b2'), 'bytovaya-tehnika': ('#eef2f6', '#c8d3df'),
    'tovary-dlya-doma': ('#f8eef0', '#e3c6cc'), 'inzhenernye-sistemy': ('#fbefe9', '#ecc4ae'), 'sport-i-otdyh': ('#eaf6f3', '#b5ddd2'),
    'novyy-god': ('#f6ecec', '#e2b9b9'), 'avtotovary': ('#eef0f3', '#c3c9d3'), 'elektronika': ('#ececf6', '#c4c4e2'),
    'tovary-dlya-detey': ('#fbf1e6', '#f0d1a8'), 'krasota-i-zdorove': ('#f9edf3', '#e7c1d5'), 'dekor': ('#f4f0ea', '#ddd2c2'),
}
# Цвет варианта → тон фона (ищем слово в характеристике «Цвет»)
COLORS = [
    ('графит', ('#e3e5e8', '#9aa1ab')), ('антрацит', ('#e3e5e8', '#959ca6')), ('чёрн', ('#e6e7ea', '#a3a8b0')),
    ('сер', ('#eceef1', '#bcc3cc')), ('бел', ('#f7f8fa', '#dde2e8')), ('молоч', ('#f8f5ef', '#e3dacb')),
    ('беж', ('#f6efe4', '#dfcdb2')), ('песоч', ('#f6efe2', '#e0cba5')), ('натурал', ('#f4ede0', '#d8c3a0')),
    ('дуб', ('#f3eadc', '#d5bd98')), ('орех', ('#efe4d8', '#c7a989')), ('светлое дерево', ('#f4ecdf', '#d9c3a0')),
    ('терракот', ('#f8e9e1', '#e2b39c')), ('коричн', ('#f1e6dd', '#cfae95')), ('мокко', ('#f0e5dc', '#cba98f')),
    ('крас', ('#fbe9e8', '#eeb3ad')), ('пудр', ('#fbedef', '#eec5cc')), ('роз', ('#fbedf0', '#efc2cc')),
    ('лаванд', ('#f1edfa', '#cfc3ec')), ('голуб', ('#eaf4fc', '#b8d8f2')), ('син', ('#e9eefb', '#b2c2ee')),
    ('мят', ('#e9f7f2', '#b5e3d2')), ('олив', ('#f0f2e4', '#cdd3a6')), ('зел', ('#ebf5ea', '#b9dbb4')),
    ('шалфей', ('#edf3ec', '#c3d6be')), ('изумруд', ('#e6f4ef', '#a9d7c5')), ('горчич', ('#fbf3df', '#ecd28f')),
    ('золот', ('#fbf4e2', '#ecd598')), ('латун', ('#faf3e2', '#e8d197')), ('шампань', ('#faf4ea', '#e9dbc0')),
    ('хром', ('#f0f3f6', '#c5ced8')), ('сатин', ('#eff2f5', '#c9d0d8')), ('матов', ('#eff1f4', '#c6ccd4')),
    ('прозрач', ('#f1f6f9', '#cfe0ea')), ('дымчат', ('#eceef1', '#bfc5cd')),
]

def variant_color(p):
    color = (next((s['value'] for s in p.get('specs', []) if s['name'] == 'Цвет'), '') + ' ' + p['name']).lower()
    return next((t for key, t in COLORS if key in color), None)

def tone(p):
    return variant_color(p) or CAT.get(p['cat'], ('#f2f4f7', '#ccd3dc'))

def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

def mix(c, d, k):
    return tuple(round(a + (b - a) * k) for a, b in zip(c, d))

def recolor(img, base_hex):
    """Перекрасить иллюстрацию в цвет варианта, сохранив светотень."""
    c = hexrgb(base_hex)
    lum = ImageOps.autocontrast(img.convert('L'), cutoff=1)
    col = ImageOps.colorize(lum, black=mix(c, (18, 22, 30), 0.78), mid=mix(c, (10, 12, 16), 0.38), white=mix(c, (255, 255, 255), 0.35))
    col.putalpha(img.getchannel('A'))
    return col

HTML = """<html><head><style>
html,body{margin:0;background:transparent}
#s{width:800px;height:600px;position:relative;overflow:hidden;
  background:radial-gradient(120% 90% at 30% 15%, var(--a) 0%, var(--a) 35%, var(--b) 100%)}
#floor{position:absolute;left:-10%;right:-10%;top:70%;bottom:-20%;
  background:linear-gradient(180deg, rgba(255,255,255,.55), rgba(255,255,255,0) 60%);
  border-top-left-radius:50% 30px;border-top-right-radius:50% 30px}
#glow{position:absolute;left:50%;top:44%;width:520px;height:520px;transform:translate(-50%,-50%);
  background:radial-gradient(circle, rgba(255,255,255,.75), rgba(255,255,255,0) 62%)}
#shadow{position:absolute;left:50%;top:79%;width:340px;height:46px;transform:translate(-50%,-50%);
  background:radial-gradient(ellipse at center, rgba(20,30,45,.30), rgba(20,30,45,0) 70%);filter:blur(4px)}
#e{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) rotate(-6deg);
  font:300px/1 'Noto Color Emoji';filter:drop-shadow(0 18px 18px rgba(20,30,45,.22))}
</style></head><body><div id="s"><div id="floor"></div><div id="glow"></div><div id="shadow"></div>
<div id="e"></div></div></body></html>"""

t0 = time.time(); n = 0
with sync_playwright() as pw:
    b = pw.chromium.launch()
    pg = b.new_page(viewport={'width': 800, 'height': 600}, device_scale_factor=1)
    pg.set_content(HTML)
    el = pg.locator('#s')
    for p in products:
        if ONLY and p['id'] not in ONLY:
            continue
        a, bb = tone(p)
        set_ = """([a,b,e,only]) => { const s=document.getElementById('s'); s.style.setProperty('--a',a); s.style.setProperty('--b',b);
          const em=document.getElementById('e'); em.textContent=e;
          for (const id of ['floor','glow','shadow']) document.getElementById(id).style.visibility = only==='emoji' ? 'hidden' : 'visible';
          s.style.background = only==='emoji' ? 'transparent' : '';
          em.style.visibility = only==='bg' ? 'hidden' : 'visible' }"""
        pg.evaluate(set_, [a, bb, p['emoji'], 'bg'])
        bg = Image.open(io.BytesIO(el.screenshot(type='png'))).convert('RGBA')
        pg.evaluate(set_, [a, bb, p['emoji'], 'emoji'])
        fg = Image.open(io.BytesIO(el.screenshot(type='png', omit_background=True))).convert('RGBA')
        vc = variant_color(p) if p['cat'] == 'dekor' else None
        if vc:
            fg = recolor(fg, vc[1])
        Image.alpha_composite(bg, fg).convert('RGB').save(OUT / f"{p['id']}.webp", 'WEBP', quality=78, method=6)
        n += 1
    b.close()
size = sum(f.stat().st_size for f in OUT.glob('*.webp'))
print(f'{n} images, {size/1e6:.1f} MB, {time.time()-t0:.0f}s')
