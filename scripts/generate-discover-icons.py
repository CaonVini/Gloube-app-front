"""Gera os ícones PNG (glifos brancos sobre transparente, 96x96) do fluxo "Descubra um destino".

Os glifos são tingidos no app via `tintColor`. Sem SVG / react-native-svg. Uso: python3 -I scripts/generate-discover-icons.py
"""
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "images" / "discover" / "icons"
FONT = ROOT / "assets" / "fonts" / "Inter-Bold.ttf"
S = 384  # canvas de trabalho (4x) -> reduzido para 96
W = 22   # espessura do traço
WHITE = (255, 255, 255, 255)


def canvas():
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def save(img, name):
    img.resize((96, 96), Image.LANCZOS).save(OUT / f"{name}.png", optimize=True)


def person(d, cx, cy, k=1.0, fill=True):
    """Cabeça + tronco (semicírculo). cy = centro da cabeça."""
    r = 34 * k
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)
    bw, bh = 62 * k, 80 * k
    top = cy + r + 10 * k
    d.pieslice([cx - bw, top, cx + bw, top + 2 * bh], 180, 360, fill=WHITE)


def heart(d, filled=True):
    r = 70
    cx1, cx2, cy = 128, 256, 150
    if filled:
        d.ellipse([cx1 - r, cy - r, cx1 + r, cy + r], fill=WHITE)
        d.ellipse([cx2 - r, cy - r, cx2 + r, cy + r], fill=WHITE)
        d.polygon([(cx1 - r + 6, cy + 30), (cx2 + r - 6, cy + 30), (192, 332)], fill=WHITE)
    else:
        return


def gen_flake():
    img, d = canvas()
    c = S // 2
    for a in (0, 60, 120):
        t = math.radians(a)
        dx, dy = math.cos(t) * 150, math.sin(t) * 150
        d.line([(c - dx, c - dy), (c + dx, c + dy)], fill=WHITE, width=W)
    for a in range(0, 360, 60):
        t = math.radians(a)
        ex, ey = c + math.cos(t) * 150, c + math.sin(t) * 150
        for off in (-35, 35):
            u = math.radians(a + 180 + off)
            d.line([(ex - math.cos(t) * 40, ey - math.sin(t) * 40), (ex - math.cos(t) * 40 + math.cos(u) * 45, ey - math.sin(t) * 40 + math.sin(u) * 45)], fill=WHITE, width=W - 4)
    save(img, "flake")


def gen_sun():
    img, d = canvas()
    c = S // 2
    d.ellipse([c - 70, c - 70, c + 70, c + 70], fill=WHITE)
    for a in range(0, 360, 45):
        t = math.radians(a)
        d.line([(c + math.cos(t) * 108, c + math.sin(t) * 108), (c + math.cos(t) * 160, c + math.sin(t) * 160)], fill=WHITE, width=W)
    save(img, "sun")


def gen_contrast():
    img, d = canvas()
    c = S // 2
    d.ellipse([c - 140, c - 140, c + 140, c + 140], outline=WHITE, width=W)
    d.pieslice([c - 140, c - 140, c + 140, c + 140], 90, 270, fill=WHITE)
    save(img, "contrast")


def gen_home():
    img, d = canvas()
    d.polygon([(192, 40), (350, 190), (34, 190)], fill=WHITE)
    d.rectangle([72, 180, 312, 330], fill=WHITE)
    d.rectangle([160, 230, 224, 330], fill=(0, 0, 0, 0))
    save(img, "home")


def gen_pin():
    img, d = canvas()
    d.ellipse([84, 36, 300, 252], fill=WHITE)
    d.polygon([(100, 200), (284, 200), (192, 350)], fill=WHITE)
    d.ellipse([142, 94, 242, 194], fill=(0, 0, 0, 0))
    save(img, "pin")


def gen_world():
    img, d = canvas()
    c = S // 2
    d.ellipse([c - 150, c - 150, c + 150, c + 150], outline=WHITE, width=W)
    d.ellipse([c - 70, c - 150, c + 70, c + 150], outline=WHITE, width=W - 6)
    d.line([(c - 150, c), (c + 150, c)], fill=WHITE, width=W - 6)
    d.line([(c - 128, c - 75), (c + 128, c - 75)], fill=WHITE, width=W - 10)
    d.line([(c - 128, c + 75), (c + 128, c + 75)], fill=WHITE, width=W - 10)
    save(img, "world")


def gen_heart():
    img, d = canvas()
    heart(d)
    save(img, "heart")
    # contorno: coração preenchido menos a versão erodida dele mesmo
    img2, d2 = canvas()
    heart(d2)
    alpha = img2.getchannel("A")
    eroded = alpha.filter(ImageFilter.MinFilter(41))
    out = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    out.paste(WHITE, mask=ImageChops.subtract(alpha, eroded))
    save(out, "heart-outline")


def gen_people(name, spec):
    img, d = canvas()
    for cx, cy, k in spec:
        person(d, cx, cy, k)
    save(img, name)


def gen_couple():
    # dois corações sobrepostos simbolizam "a dois": usamos duas pessoas próximas + coração pequeno
    img, d = canvas()
    person(d, 120, 120, 1.05)
    person(d, 264, 120, 1.05)
    save(img, "couple")


def gen_elder():
    img, d = canvas()
    person(d, 150, 110, 1.05)
    d.line([(300, 200), (300, 340)], fill=WHITE, width=W)
    d.arc([262, 160, 338, 236], 180, 360, fill=WHITE, width=W)
    save(img, "elder")


def gen_access():
    img, d = canvas()
    c = S // 2
    d.ellipse([c - 160, c - 160, c + 160, c + 160], outline=WHITE, width=W)
    d.ellipse([c - 18 - 14, 92, c + 18 + 14 - 4, 124 + 28], fill=WHITE)
    d.line([(c - 2, 150), (c - 2, 230)], fill=WHITE, width=W - 4)
    d.line([(c - 50, 170), (c + 50, 170)], fill=WHITE, width=W - 6)
    d.line([(c - 2, 230), (c + 52, 230), (c + 78, 290)], fill=WHITE, width=W - 6)
    d.arc([c - 72, 200, c + 24, 296], 40, 320, fill=WHITE, width=W - 6)
    save(img, "access")


def gen_paw():
    img, d = canvas()
    d.ellipse([112, 200, 272, 330], fill=WHITE)
    for cx, cy, r in ((82, 190, 34), (150, 120, 36), (234, 120, 36), (302, 190, 34)):
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=WHITE)
    save(img, "paw")


def gen_calendar(name, mode):
    img, d = canvas()
    d.rounded_rectangle([46, 70, 338, 338], radius=36, outline=WHITE, width=W)
    d.rectangle([46, 70, 338, 140], fill=WHITE)
    for x in (120, 264):
        d.rounded_rectangle([x - 11, 34, x + 11, 100], radius=11, fill=WHITE)
    if mode == "dates":
        for gx in range(3):
            for gy in range(2):
                x, y = 100 + gx * 70, 178 + gy * 66
                d.rounded_rectangle([x, y, x + 40, y + 40], radius=8, fill=WHITE)
    elif mode == "month":
        d.rounded_rectangle([96, 176, 288, 300], radius=16, fill=WHITE)
    save(img, name)


def gen_text(name, text, size):
    img, d = canvas()
    f = ImageFont.truetype(str(FONT), size)
    bb = d.textbbox((0, 0), text, font=f)
    d.text(((S - (bb[2] - bb[0])) / 2 - bb[0], (S - (bb[3] - bb[1])) / 2 - bb[1]), text, font=f, fill=WHITE)
    save(img, name)


def gen_infinity():
    img, d = canvas()
    d.ellipse([34, 112, 214, 272], outline=WHITE, width=W)
    d.ellipse([170, 112, 350, 272], outline=WHITE, width=W)
    save(img, "infinity")


def gen_check():
    img, d = canvas()
    d.line([(78, 200), (162, 284), (312, 108)], fill=WHITE, width=34, joint="curve")
    for p in ((78, 200), (162, 284), (312, 108)):
        d.ellipse([p[0] - 17, p[1] - 17, p[0] + 17, p[1] + 17], fill=WHITE)
    save(img, "check")


def gen_chevron(name, left):
    img, d = canvas()
    pts = [(240, 70), (120, 192), (240, 314)] if left else [(144, 70), (264, 192), (144, 314)]
    d.line(pts, fill=WHITE, width=34, joint="curve")
    for p in (pts[0], pts[2]):
        d.ellipse([p[0] - 17, p[1] - 17, p[0] + 17, p[1] + 17], fill=WHITE)
    save(img, name)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    gen_flake(); gen_sun(); gen_contrast(); gen_home(); gen_pin(); gen_world(); gen_heart()
    gen_couple()
    gen_people("friends", [(90, 130, 0.8), (192, 112, 0.95), (294, 130, 0.8)])
    gen_people("family", [(110, 112, 1.0), (274, 112, 1.0), (192, 190, 0.7)])
    gen_people("solo", [(192, 108, 1.25)])
    gen_people("child", [(192, 170, 0.95)])
    gen_elder(); gen_access(); gen_paw()
    gen_calendar("calendar", "dates"); gen_calendar("calendar-month", "month")
    gen_text("help", "?", 300)
    gen_text("coin1", "$", 280); gen_text("coin2", "$$", 230); gen_text("coin3", "$$$", 170); gen_text("coin4", "$$$$", 130)
    gen_infinity(); gen_check(); gen_chevron("chevron-left", True)
