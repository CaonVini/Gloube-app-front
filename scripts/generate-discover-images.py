"""Gera as ilustrações PNG leves (sem SVG, sem rede) usadas no fluxo "Descubra um destino".

São ilustrações estilizadas provisórias: troque por fotos otimizadas (WebP/PNG < 80 KB) quando houver licença.
Uso: python3 scripts/generate-discover-images.py
"""
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "discover"
W, H = 640, 400  # destinos (16:10); tiles de experiência usam 320x320


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(w, h, top, bottom):
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=lerp(top, bottom, y / (h - 1)))
    return img


def sun(d, w, h, color, cx=0.75, cy=0.28, r=0.09):
    x, y, rr = int(w * cx), int(h * cy), int(h * r)
    d.ellipse([x - rr, y - rr, x + rr, y + rr], fill=color)


def sea(d, w, h, horizon, c1, c2):
    top = int(h * horizon)
    for y in range(top, h):
        d.line([(0, y), (w, y)], fill=lerp(c1, c2, (y - top) / max(1, h - top)))


def sand(d, w, h, color, start=0.8):
    d.polygon([(0, h), (0, int(h * start)), (w * 0.5, int(h * (start - 0.03))), (w, int(h * start)), (w, h)], fill=color)


def palm(d, x, base, height, trunk=(90, 62, 40), leaf=(30, 110, 70)):
    d.line([(x, base), (x + height * 0.1, base - height)], fill=trunk, width=max(3, height // 16))
    tx, ty = x + height * 0.1, base - height
    for ang in range(-160, 20, 30):
        a = math.radians(ang)
        d.line([(tx, ty), (tx + math.cos(a) * height * 0.55, ty + math.sin(a) * height * 0.35 + height * 0.1)], fill=leaf, width=max(3, height // 14))


def mountains(d, w, h, base, colors, peaks, snow=None):
    for i, (cx, ph, half) in enumerate(peaks):
        col = colors[i % len(colors)]
        top = (int(w * cx), int(h * ph))
        d.polygon([(int(w * cx - w * half), int(h * base)), top, (int(w * cx + w * half), int(h * base))], fill=col)
        if snow:
            s = int(w * half * 0.38)
            d.polygon([(top[0] - s, top[1] + int(s * 1.1)), top, (top[0] + s, top[1] + int(s * 1.1)), (top[0], top[1] + int(s * 0.8))], fill=snow)
    d.rectangle([0, int(h * base) - 1, w, h], fill=colors[-1])


def city(d, w, h, base, colors, seed, lights=True):
    rnd = random.Random(seed)
    x = 0
    while x < w:
        bw = rnd.randint(28, 62)
        bh = rnd.randint(int(h * 0.15), int(h * 0.45))
        col = colors[rnd.randrange(len(colors))]
        d.rectangle([x, int(h * base) - bh, x + bw, int(h * base)], fill=col)
        if lights:
            for wy in range(int(h * base) - bh + 8, int(h * base) - 6, 14):
                for wx in range(x + 6, x + bw - 6, 12):
                    if rnd.random() > 0.45:
                        d.rectangle([wx, wy, wx + 4, wy + 6], fill=(255, 226, 150))
        x += bw + 3
    d.rectangle([0, int(h * base), w, h], fill=colors[0])


def trees(d, w, h, base, n, seed, greens):
    rnd = random.Random(seed)
    for _ in range(n):
        x = rnd.randint(0, w)
        th = rnd.randint(int(h * 0.12), int(h * 0.3))
        y = int(h * base) + rnd.randint(0, int(h * 0.12))
        d.rectangle([x - 2, y - th // 3, x + 2, y], fill=(70, 50, 35))
        d.ellipse([x - th // 2, y - th - th // 4, x + th // 2, y - th // 4], fill=greens[rnd.randrange(len(greens))])


def snowflakes(d, w, h, n, seed):
    rnd = random.Random(seed)
    for _ in range(n):
        x, y, r = rnd.randint(0, w), rnd.randint(0, h), rnd.randint(1, 3)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255))


def scene(kind, w, h, seed=1, variant=0):
    pal = {
        0: dict(sky=((255, 214, 170), (255, 245, 225)), sea=((38, 170, 190), (14, 100, 140)), sand=(240, 220, 175)),
        1: dict(sky=((118, 196, 235), (225, 244, 250)), sea=((64, 214, 214), (22, 122, 166)), sand=(248, 236, 200)),
        2: dict(sky=((250, 176, 140), (255, 225, 190)), sea=((40, 140, 170), (16, 70, 120)), sand=(232, 200, 150)),
    }[variant % 3]
    if kind == "praia":
        img = gradient(w, h, *pal["sky"])
        d = ImageDraw.Draw(img)
        sun(d, w, h, (255, 244, 200))
        sea(d, w, h, 0.55, *pal["sea"])
        sand(d, w, h, pal["sand"])
        palm(d, int(w * 0.18), int(h * 0.88), int(h * 0.42))
        palm(d, int(w * 0.28), int(h * 0.92), int(h * 0.3), leaf=(40, 130, 80))
    elif kind == "montanha":
        img = gradient(w, h, (120, 170, 215), (225, 238, 245))
        d = ImageDraw.Draw(img)
        mountains(d, w, h, 0.85, [(98, 112, 128), (74, 92, 110), (54, 84, 70)], [(0.28, 0.3, 0.32), (0.62, 0.2, 0.36), (0.88, 0.38, 0.28)], snow=(250, 252, 255))
    elif kind == "cidade":
        img = gradient(w, h, (248, 170, 120), (255, 226, 190)) if variant % 2 == 0 else gradient(w, h, (40, 52, 96), (170, 120, 150))
        d = ImageDraw.Draw(img)
        sun(d, w, h, (255, 236, 190), 0.8, 0.3, 0.1)
        city(d, w, h, 0.9, [(48, 58, 74), (68, 80, 98), (88, 100, 118)], seed)
    elif kind == "natureza":
        img = gradient(w, h, (172, 222, 200), (238, 246, 220))
        d = ImageDraw.Draw(img)
        sun(d, w, h, (255, 250, 210), 0.2, 0.25, 0.08)
        mountains(d, w, h, 0.75, [(92, 150, 118), (64, 120, 96), (40, 92, 74)], [(0.3, 0.38, 0.36), (0.75, 0.32, 0.4)])
        trees(d, w, h, 0.78, 22, seed, [(36, 110, 70), (52, 140, 84), (28, 90, 62)])
        d.polygon([(int(w * 0.4), int(h * 0.76)), (int(w * 0.45), int(h * 0.76)), (int(w * 0.6), h), (int(w * 0.32), h)], fill=(120, 196, 214))
    elif kind == "neve":
        img = gradient(w, h, (150, 184, 224), (236, 244, 252))
        d = ImageDraw.Draw(img)
        mountains(d, w, h, 0.88, [(206, 220, 236), (170, 192, 218), (244, 248, 253)], [(0.25, 0.28, 0.34), (0.6, 0.18, 0.38), (0.92, 0.36, 0.3)], snow=(255, 255, 255))
        for tx in (0.15, 0.22, 0.8, 0.86):
            x, y = int(w * tx), int(h * 0.86)
            d.polygon([(x - 14, y), (x, y - 44), (x + 14, y)], fill=(34, 86, 70))
        snowflakes(d, w, h, 60, seed)
    return img


DESTINOS = {
    "maldivas": ("praia", 1), "noronha": ("praia", 2), "gramado": ("montanha", 0), "jericoacoara": ("praia", 0),
    "bariloche": ("neve", 1), "lisboa": ("cidade", 0), "chapada": ("natureza", 0), "rio": ("praia", 2),
    "santiago": ("neve", 2), "cancun": ("praia", 1), "campos": ("montanha", 1), "bonito": ("natureza", 1),
}
TILES = ["praia", "montanha", "cidade", "natureza", "neve"]


def save(img, name):
    # paleta de 64 cores: PNG pequeno, sem perda visível em ilustrações chapadas
    img.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(OUT / f"{name}.png", optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for i, (name, (kind, var)) in enumerate(DESTINOS.items()):
        save(scene(kind, W, H, seed=i + 3, variant=var), f"dest-{name}")
    for i, kind in enumerate(TILES):
        save(scene(kind, 320, 320, seed=i + 40), f"exp-{kind}")
