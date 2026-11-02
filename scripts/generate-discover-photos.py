"""Gera as imagens (JPG, aparência de foto: grão, neblina atmosférica, brilho) do fluxo "Descubra um destino".

Renderização procedural 100% local (numpy + Pillow): sem rede, sem SVG. São imagens PROVISÓRIAS de boa qualidade visual,
mas não são fotos reais — para trocar, basta substituir os arquivos (mesmo nome) ou editar src/presentation/discover/assets.ts.
Uso: python3 -I scripts/generate-discover-photos.py
"""
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter

OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "discover" / "photos"
QW, QH = 480, 600  # cartões do questionário (retrato)
DW, DH = 800, 540  # cartões de destino
WW, WH = 720, 340  # cartões largos do questionário (paisagem)


def hexc(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], dtype=np.float32)


# ---------- utilidades ----------
def noise(w, h, scale, seed):
    rng = np.random.default_rng(seed)
    g = rng.random((h // scale + 3, w // scale + 3)).astype(np.float32)
    im = Image.fromarray(g, mode="F").resize((w + scale * 2, h + scale * 2), Image.BICUBIC)
    return np.asarray(im)[:h, :w]


def fbm(w, h, base, seed, octaves=4):
    out = np.zeros((h, w), np.float32)
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        out += amp * noise(w, h, max(2, base // (2 ** o)), seed + o * 17)
        tot += amp
        amp *= 0.5
    return out / tot


def gradient(w, h, stops):
    """stops: [(pos 0-1, hex)]"""
    ys = np.linspace(0, 1, h, dtype=np.float32)
    pos = [p for p, _ in stops]
    cols = np.stack([hexc(c) for _, c in stops])
    img = np.stack([np.interp(ys, pos, cols[:, i]) for i in range(3)], axis=-1)
    return np.repeat(img[:, None, :], w, axis=1).astype(np.float32)


def glow(img, cx, cy, r, color, strength=1.0):
    h, w, _ = img.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    d = ((xx - cx * w) ** 2 + (yy - cy * h) ** 2) / (r * min(w, h)) ** 2
    g = np.exp(-d * 3.0)[..., None] * strength
    return img + g * hexc(color)


def clouds(img, seed, color, y0=0.0, y1=0.5, density=0.55, soft=1.0):
    h, w, _ = img.shape
    n = fbm(w, h, 90, seed, 5)
    m = np.clip((n - density) * 4.0, 0, 1)
    yy = np.linspace(0, 1, h, dtype=np.float32)[:, None]
    band = np.clip(1 - np.abs((yy - (y0 + y1) / 2) / ((y1 - y0) / 2)), 0, 1)
    m = (m * band * soft)[..., None]
    return img * (1 - m) + hexc(color) * m


def ridge_line(w, base, amp, seed, rough=0.55, octaves=7):
    rng = np.random.default_rng(seed)
    x = np.linspace(0, 1, w)
    y = np.zeros(w)
    a = 1.0
    for o in range(octaves):
        n = 2 ** (o + 1) + 1
        pts = rng.random(n)
        y += a * np.interp(x, np.linspace(0, 1, n), pts)
        a *= rough
    y = (y - y.min()) / (y.max() - y.min() + 1e-6)
    return base - y * amp


def paint_ridge(img, line, top, bottom, seed, snow=None, snow_line=None, haze=None, tex=0.12):
    """Preenche abaixo da linha com gradiente + textura; neve nas partes altas."""
    h, w, _ = img.shape
    yy = np.arange(h, dtype=np.float32)[:, None]
    mask = (yy >= line[None, :]).astype(np.float32)
    mask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32) / 255.0
    depth = np.clip((yy - line[None, :]) / max(1.0, (h - line.min())), 0, 1)
    col = hexc(top)[None, None, :] * (1 - depth[..., None]) + hexc(bottom)[None, None, :] * depth[..., None]
    t = fbm(w, h, 14, seed, 4)[..., None]
    col = col * (1 - tex + t * tex * 2)
    # sombreamento de encosta: gradiente lateral pela inclinação da linha
    slope = np.convolve(np.gradient(line), np.ones(25) / 25, mode="same")
    sh2 = np.clip(slope / 5.0, -0.6, 0.6)[None, :] + (fbm(w, h, 40, seed + 91, 3) - 0.5) * 0.5
    sh = sh2[..., None]
    col = col * (1 - sh * 0.30)
    if snow is not None:
        sl = snow_line if snow_line is not None else (line.min() + (line.max() - line.min()) * 0.4)
        sl_arr = np.minimum(line, sl)  # neve cobre as cristas; mais fina conforme desce
        edge = (line[None, :] + (sl - line.min()) * 0.0)
        alt = np.clip((sl + 40 - line[None, :]) / 60.0, 0, 1)
        depthpx = np.clip(1 - (yy - line[None, :]) / (22 + 90 * alt), 0, 1)
        sn = np.clip(alt * depthpx * (0.8 + 0.6 * (t.squeeze(-1) - 0.5)) * 1.3, 0, 1)[..., None]
        shade = 1 - 0.22 * np.clip(sh, 0, 1)
        col = col * (1 - sn) + hexc(snow) * sn * shade
    out = img * (1 - mask[..., None]) + col * mask[..., None]
    if haze:
        hz = np.clip(1 - depth * 2.2, 0, 1)[..., None] * mask[..., None] * 0.2
        out = out * (1 - hz) + hexc(haze) * hz
    return out


def layer(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def composite_pil(img, layer_img, blur=0.0, opacity=1.0):
    if blur:
        layer_img = layer_img.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(layer_img).astype(np.float32) / 255.0
    rgb, al = a[..., :3], a[..., 3:4] * opacity
    return img * (1 - al) + rgb * al


def conifer(d, x, y, hgt, color, wid=None):
    wid = wid or hgt * 0.38
    for i in range(5):
        t = i / 5
        yy = y - hgt * (1 - t)
        ww = wid * (0.25 + 0.75 * t)
        d.polygon([(x - ww, yy + hgt * 0.22), (x, yy), (x + ww, yy + hgt * 0.22)], fill=color)
    d.rectangle([x - 1.5, y, x + 1.5, y + hgt * 0.1], fill=color)


def forest(img, line, seed, color, density, hmin, hmax, shade=None):
    h, w, _ = img.shape
    rng = np.random.default_rng(seed)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    c = tuple(int(v * 255) for v in hexc(color)) + (255,)
    for _ in range(density):
        x = int(rng.integers(0, w))
        y = int(line[x] + rng.integers(2, 40))
        conifer(d, x, y, float(rng.uniform(hmin, hmax)), c)
    return composite_pil(img, L, blur=0.6)


def round_tree(d, x, y, r, color, light):
    d.rectangle([x - r * 0.08, y - r * 0.4, x + r * 0.08, y + r * 0.2], fill=(60, 42, 30, 255))
    for _ in range(7):
        ox, oy = np.random.uniform(-r * 0.5, r * 0.5), np.random.uniform(-r * 0.4, r * 0.3)
        rr = r * np.random.uniform(0.5, 0.8)
        d.ellipse([x + ox - rr, y - r * 0.9 + oy - rr, x + ox + rr, y - r * 0.9 + oy + rr], fill=color)
    d.ellipse([x - r * 0.35, y - r * 1.5, x + r * 0.35, y - r * 0.95], fill=light)


def palm(d, x, y, hgt, lean, color, trunk=(52, 38, 28, 255)):
    pts = []
    for i in range(0, 21):
        t = i / 20
        pts.append((x + lean * hgt * (t ** 1.8), y - hgt * t))
    d.line(pts, fill=trunk, width=max(4, int(hgt / 32)))
    tx, ty = pts[-1]
    L = hgt * 0.55
    for a in range(-175, 10, 20):
        r = math.radians(a)
        droop = 0.55 + 0.35 * abs(math.cos(r))
        n = 14
        top, bot = [], []
        for k in range(n + 1):
            t = k / n
            px = tx + math.cos(r) * L * t
            py = ty + math.sin(r) * L * t * 0.7 + (t ** 2) * L * droop * 0.55
            w = math.sin(t * math.pi) ** 0.8 * L * 0.075
            nx, ny = -math.sin(r) * 0.2, 1.0
            top.append((px - nx * w, py - ny * w))
            bot.append((px + nx * w, py + ny * w * 0.4))
        d.polygon(top + bot[::-1], fill=color)


def person(d, x, y, hgt, color, child=False):
    s_ = hgt
    d.ellipse([x - s_ * 0.085, y - s_, x + s_ * 0.085, y - s_ * 0.83], fill=color)
    d.rounded_rectangle([x - s_ * 0.045, y - s_ * 0.84, x + s_ * 0.045, y - s_ * 0.76], radius=int(s_ * 0.03) + 1, fill=color)
    d.rounded_rectangle([x - s_ * 0.17, y - s_ * 0.78, x + s_ * 0.17, y - s_ * 0.40], radius=int(s_ * 0.08) + 1, fill=color)
    d.rounded_rectangle([x - s_ * 0.125, y - s_ * 0.44, x - s_ * 0.01, y], radius=int(s_ * 0.04) + 1, fill=color)
    d.rounded_rectangle([x + s_ * 0.01, y - s_ * 0.44, x + s_ * 0.125, y], radius=int(s_ * 0.04) + 1, fill=color)


def finish(img, grain=0.035, vignette=0.28, warm=None, contrast=1.06, seed=1):
    h, w, _ = img.shape
    if warm is not None:
        img = img * (1 - 0.08) + hexc(warm) * 0.08
    img = np.clip(img, 0, 1)
    img = (img - 0.5) * contrast + 0.5
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    v = 1 - vignette * (((xx / w - 0.5) ** 2 + (yy / h - 0.5) ** 2) * 2.2)
    img = img * v[..., None]
    rng = np.random.default_rng(seed)
    img = img + rng.normal(0, grain, (h, w, 1)).astype(np.float32)
    im = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    return im.filter(ImageFilter.GaussianBlur(0.45))


# ---------- cenas ----------
def sea_band(img, y0, top, bottom, seed, sun_x=None, sun_color="#FFE9B0", ripple=0.06, sheen=0.5):
    h, w, _ = img.shape
    yy = np.arange(h, dtype=np.float32)[:, None]
    mask = np.clip((yy - y0) / 2.0, 0, 1)
    depth = np.clip((yy - y0) / (h - y0), 0, 1)
    col = hexc(top)[None, None, :] * (1 - depth[..., None]) + hexc(bottom)[None, None, :] * depth[..., None]
    n = fbm(w, h, 6, seed, 3)
    n2 = np.asarray(Image.fromarray(n).resize((w, max(2, h // 8)), Image.BICUBIC).resize((w, h), Image.BICUBIC))
    col = col * (1 - ripple + n2[..., None] * ripple * 2.2)
    if sun_x is not None:
        xx = np.arange(w, dtype=np.float32)[None, :] / w
        streak = np.exp(-((xx - sun_x) ** 2) / (0.012 + 0.05 * depth)) * (0.4 + n2) * np.clip(1 - depth * 0.6, 0, 1)
        col = col + streak[..., None] * hexc(sun_color) * sheen
    return img * (1 - mask[..., None]) + col * mask[..., None]


def scene_beach(w, h, seed=1, tone="turquoise", palms=True, sunset=False, people=False):
    sky = [(0, "#6FB5E8"), (0.45, "#BFE3F5"), (0.62, "#F6EEDC")] if not sunset else [(0, "#3C4F8A"), (0.35, "#C77A8B"), (0.55, "#FFB56B"), (0.62, "#FFE2A8")]
    img = gradient(w, h, sky)
    hor = 0.56
    if sunset:
        img = glow(img, 0.68, hor - 0.02, 0.5, "#FFC87A", 1.1)
    else:
        img = glow(img, 0.78, 0.2, 0.35, "#FFFFFF", 0.5)
    img = clouds(img, seed + 3, "#FFFFFF" if not sunset else "#FFD9B8", 0.08, 0.5, 0.52, 0.85)
    seas = {"turquoise": ("#6FE3D8", "#0F7FA0"), "deep": ("#2AA6C4", "#0A4C73"), "lagoon": ("#9DF0E0", "#14A3B5")}[tone]
    img = sea_band(img, int(h * hor), seas[0], seas[1], seed, sun_x=0.68 if sunset else 0.78, sun_color="#FFE6B5" if sunset else "#FFFFFF")
    # faixa de espuma e areia
    sand_top = int(h * 0.80)
    wave = (np.sin(np.linspace(0, 7, w) + seed) * 6 + np.sin(np.linspace(0, 19, w)) * 2).astype(np.float32)
    line = sand_top + wave
    img = paint_ridge(img, line, "#F3E2BD" if not sunset else "#D9A27A", "#C9A877" if not sunset else "#7E5A55", seed + 9, tex=0.08)
    foam = np.exp(-((np.arange(h, dtype=np.float32)[:, None] - (line[None, :] - 3)) ** 2) / 10.0) * 0.8
    img = img * (1 - foam[..., None] * 0.7) + foam[..., None] * 0.7 * hexc("#FFFFFF")
    if palms:
        L = layer(w, h)
        d = ImageDraw.Draw(L)
        rng = np.random.default_rng(seed)
        col = (22, 74, 52, 255) if not sunset else (28, 24, 40, 255)
        palm(d, int(w * 0.14), int(h * 0.9), h * 0.52, 0.18, col)
        palm(d, int(w * 0.27), int(h * 0.95), h * 0.34, 0.22, col)
        img = composite_pil(img, L, blur=0.7)
    if people:
        L = layer(w, h)
        d = ImageDraw.Draw(L)
        sc = (24, 18, 30, 255)
        person(d, int(w * 0.52), int(h * 0.9), h * 0.2, sc)
        person(d, int(w * 0.6), int(h * 0.9), h * 0.185, sc)
        img = composite_pil(img, L, blur=0.8)
    return finish(img, seed=seed, warm="#FFD7A0" if sunset else None)


def scene_mountain(w, h, seed=2, snow=False, dusk=False, cabin=False, lake=False):
    sky = [(0, "#2E3F73"), (0.4, "#C98B9A"), (0.62, "#FFC9A0")] if dusk else [(0, "#5E9BE0"), (0.5, "#CFE6F6"), (0.72, "#F4F1E6")]
    img = gradient(w, h, sky)
    img = glow(img, 0.5, 0.52, 0.5, "#FFD59A" if dusk else "#FFFFFF", 0.9 if dusk else 0.4)
    img = clouds(img, seed + 4, "#FFE0C8" if dusk else "#FFFFFF", 0.05, 0.5, 0.5, 0.9)
    far = ridge_line(w, h * 0.58, h * 0.30, seed + 1)
    mid = ridge_line(w, h * 0.68, h * 0.26, seed + 2)
    near = ridge_line(w, h * 0.80, h * 0.20, seed + 3, rough=0.5)
    snow_c = "#F7FAFF" if snow else None
    img = paint_ridge(img, far, "#6E7FA8" if dusk else "#7A93B8", "#B3A6BC" if dusk else "#A6B9D2", seed, snow=snow_c, haze="#FFD9B8" if dusk else "#EAF2FA")
    img = paint_ridge(img, mid, "#4A5F7E" if dusk else "#5F7C96", "#7C8DA6" if dusk else "#8DA8B8", seed + 5, snow=snow_c, haze="#FFD9B8" if dusk else "#EAF2FA")
    if lake:
        yl = int(h * 0.80)
        img = sea_band(img, yl, "#7DB5C9", "#1D5873", seed, sun_x=0.5, sun_color="#FFFFFF", sheen=0.3)
    else:
        img = paint_ridge(img, near, "#2D4B45", "#122A28", seed + 6)
        img = forest(img, near, seed + 7, "#10261F", 130, h * 0.05, h * 0.12)
    if cabin:
        L = layer(w, h)
        d = ImageDraw.Draw(L)
        x0, y0 = int(w * 0.18), int(h * 0.86)
        d.polygon([(x0 - 6, y0 - 38), (x0 + 28, y0 - 70), (x0 + 82, y0 - 70), (x0 + 118, y0 - 38)], fill=(70, 46, 36, 255))
        d.rectangle([x0, y0 - 40, x0 + 112, y0], fill=(96, 64, 44, 255))
        d.rectangle([x0 + 20, y0 - 30, x0 + 42, y0 - 12], fill=(255, 196, 110, 255))
        d.rectangle([x0 + 66, y0 - 30, x0 + 88, y0 - 12], fill=(255, 210, 130, 255))
        for i in range(0, 5):
            conifer(d, x0 + 150 + i * 26, y0 + 4, 80 + (i % 3) * 18, (10, 36, 30, 255))
            conifer(d, x0 - 30 - i * 22, y0 + 6, 70 + (i % 2) * 22, (10, 36, 30, 255))
        img = composite_pil(img, L, blur=0.6)
        img = glow(img, 0.27, 0.80, 0.07, "#FFB45A", 0.45)
    if snow:
        rng = np.random.default_rng(seed)
        L = layer(w, h)
        d = ImageDraw.Draw(L)
        for _ in range(int(w * h / 2800)):
            x, y, r = rng.integers(0, w), rng.integers(0, h), rng.uniform(0.8, 2.4)
            d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, int(rng.uniform(120, 230))))
        img = composite_pil(img, L, blur=0.5)
    return finish(img, seed=seed)


def scene_city(w, h, seed=3, dusk=True, coast=False):
    sky = [(0, "#26356B"), (0.38, "#9A6A9E"), (0.6, "#FF9E6B"), (0.72, "#FFD59A")] if dusk else [(0, "#6AA4E4"), (0.6, "#CBE4F7"), (0.75, "#F4EEDF")]
    img = gradient(w, h, sky)
    img = glow(img, 0.7, 0.62, 0.45, "#FFC47A", 1.0 if dusk else 0.4)
    img = clouds(img, seed + 2, "#FFB7A0" if dusk else "#FFFFFF", 0.1, 0.55, 0.5, 0.8)
    rng = np.random.default_rng(seed)
    base = int(h * 0.82)
    for depth, (col, wmin, wmax, hmin, hmax, lit) in enumerate([("#59537D", 20, 46, 0.12, 0.30, 0.2), ("#3A3556", 26, 60, 0.14, 0.40, 0.4), ("#201C33", 34, 74, 0.16, 0.50, 0.65)]):
        L = layer(w, h)
        d = ImageDraw.Draw(L)
        x = -10
        while x < w:
            bw = int(rng.integers(wmin, wmax))
            bh = int(h * rng.uniform(hmin, hmax))
            c = tuple(int(v * 255) for v in hexc(col)) + (255,)
            d.rectangle([x, base - bh, x + bw, base + 5], fill=c)
            if rng.random() < 0.3:
                d.rectangle([x + bw * 0.4, base - bh - int(h * 0.04), x + bw * 0.6, base - bh], fill=c)
            for wy in range(int(base - bh + 8), base - 6, 12):
                for wx in range(int(x + 5), int(x + bw - 6), 10):
                    if rng.random() < lit:
                        d.rectangle([wx, wy, wx + 4, wy + 6], fill=(255, int(rng.uniform(200, 232)), int(rng.uniform(130, 170)), 255))
            x += bw + int(rng.integers(0, 6))
        img = composite_pil(img, L, blur=0.5 + (2 - depth) * 0.0)
        if depth < 2:
            hz = np.clip(np.linspace(0.18, 0.0, h)[:, None, None], 0, 1)
            img = img * (1 - hz * 0.5) + hexc("#FFB48A") * hz * 0.5
    img = sea_band(img, base, "#35345A", "#0E0D22", seed, sun_x=0.7, sun_color="#FFB86A", ripple=0.08, sheen=0.55)
    return finish(img, seed=seed, warm="#FFB47A")


def scene_nature(w, h, seed=4, river=False, golden=False):
    sky = [(0, "#79B8E0"), (0.45, "#DCEFD9"), (0.6, "#FFF3CF")] if golden else [(0, "#8DC4DE"), (0.5, "#E7F2E0"), (0.62, "#F7F3DC")]
    img = gradient(w, h, sky)
    img = glow(img, 0.25, 0.28, 0.4, "#FFF6C8", 0.9)
    img = clouds(img, seed + 1, "#FFFFFF", 0.05, 0.45, 0.55, 0.8)
    far = ridge_line(w, h * 0.50, h * 0.2, seed + 1, rough=0.6)
    mid = ridge_line(w, h * 0.60, h * 0.18, seed + 2)
    img = paint_ridge(img, far, "#6FA18A", "#A5C8B0", seed, haze="#EAF6E8")
    img = paint_ridge(img, mid, "#3F7A5A", "#6FA27E", seed + 3, haze="#EAF6E8")
    near = ridge_line(w, h * 0.72, h * 0.12, seed + 4)
    img = paint_ridge(img, near, "#245A3E", "#0F3524", seed + 5, tex=0.2)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    rng = np.random.default_rng(seed)
    for _ in range(24):
        x = int(rng.integers(0, w))
        y = int(near[x] + rng.integers(0, int(h * 0.2)))
        round_tree(d, x, y, float(rng.uniform(h * 0.04, h * 0.085) * (0.8 + (y / h))), (30 + int(rng.integers(0, 24)), 96 + int(rng.integers(0, 40)), 58, 255), (92, 156, 84, 255))
    img = composite_pil(img, L, blur=0.8)
    if river:
        yy = np.arange(h, dtype=np.float32)[:, None]
        xx = np.arange(w, dtype=np.float32)[None, :] / w
        cx = 0.5 + 0.12 * np.sin((yy / h) * 6.0)
        wdt = 0.04 + 0.28 * np.clip((yy / h - 0.7) / 0.3, 0, 1) ** 1.3
        m = np.clip(1 - np.abs(xx - cx) / np.maximum(wdt, 0.01), 0, 1) * (yy > h * 0.72)
        m = np.clip(m * 3, 0, 1)[..., None]
        water = np.array(hexc("#4ED0C4"))[None, None, :] * 0.8 + 0.2 * hexc("#FFFFFF")
        img = img * (1 - m) + water * m
    return finish(img, seed=seed, warm="#FFF1C0")


def scene_sunrise_hills(w, h, seed=5):
    img = gradient(w, h, [(0, "#5C7BC9"), (0.35, "#E7A7B3"), (0.55, "#FFD7A0"), (0.6, "#FFF0CF")])
    img = glow(img, 0.5, 0.58, 0.5, "#FFE4A8", 1.2)
    img = clouds(img, seed + 2, "#FFD6C0", 0.1, 0.5, 0.5, 0.85)
    for i, (b, a, top, bot) in enumerate([(0.62, 0.12, "#B7B4C9", "#D9C9C9"), (0.70, 0.14, "#7C9A8B", "#A4BFA0"), (0.80, 0.16, "#3F6A4E", "#2A4A38"), (0.92, 0.12, "#1D3B2C", "#10261C")]):
        line = ridge_line(w, h * b, h * a, seed + i, rough=0.45, octaves=5)
        img = paint_ridge(img, line, top, bot, seed + i, haze="#FFE2B8" if i < 2 else None)
    # estrada
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    d.polygon([(w * 0.46, h * 0.80), (w * 0.54, h * 0.80), (w * 0.80, h), (w * 0.15, h)], fill=(214, 184, 140, 255))
    img = composite_pil(img, L, blur=1.0, opacity=0.85)
    return finish(img, seed=seed, warm="#FFD9A0")


def scene_clouds(w, h, seed=6):
    img = gradient(w, h, [(0, "#1F4E9C"), (0.4, "#6FA2DD"), (0.62, "#FFC890"), (0.7, "#FFE9C4")])
    img = glow(img, 0.3, 0.64, 0.5, "#FFD79A", 1.2)
    for i, (y0, y1, c) in enumerate([(0.15, 0.55, "#FFFFFF"), (0.55, 0.85, "#FFF2E2"), (0.7, 1.05, "#FFE0C0")]):
        img = clouds(img, seed + i * 5, c, y0, y1, 0.42 - i * 0.04, 1.0)
    return finish(img, seed=seed, warm="#FFD6A0")


def scene_coast(w, h, seed=7, dune=False):
    img = gradient(w, h, [(0, "#66A9E6"), (0.5, "#CFE8F7"), (0.6, "#FFF1D6")] if not dune else [(0, "#4C6FB5"), (0.35, "#E39A8E"), (0.55, "#FFC88A"), (0.62, "#FFE6B0")])
    img = glow(img, 0.7, 0.55, 0.45, "#FFE2A0", 1.0 if dune else 0.5)
    img = clouds(img, seed + 3, "#FFFFFF" if not dune else "#FFD0B0", 0.05, 0.45, 0.55, 0.8)
    img = sea_band(img, int(h * 0.55), "#58D6D0", "#0E6F95", seed, sun_x=0.7, sun_color="#FFF0C8")
    if dune:
        for i, (b, a, top, bot) in enumerate([(0.74, 0.10, "#E7B27E", "#C98C62"), (0.86, 0.12, "#D89A6A", "#A8704C")]):
            img = paint_ridge(img, ridge_line(w, h * b, h * a, seed + i, rough=0.35, octaves=4), top, bot, seed + i, tex=0.1)
    else:
        cliff = ridge_line(w, h * 0.78, h * 0.34, seed + 4, rough=0.5, octaves=5)
        cliff = np.maximum(cliff, 0) + np.linspace(0, h * 0.12, w) * 0
        cliff = cliff + np.linspace(-h * 0.28, h * 0.12, w)  # falésia à esquerda
        img = paint_ridge(img, np.clip(cliff, h * 0.35, h), "#6B8F4E", "#8C6B4A", seed + 5, tex=0.18)
        img = forest(img, np.clip(cliff, h * 0.35, h), seed + 6, "#2F5B33", 60, h * 0.04, h * 0.09)
        L = layer(w, h)
        d = ImageDraw.Draw(L)
        palm(d, int(w * 0.12), int(cliff[int(w * 0.12)] + 8), h * 0.3, 0.2, (24, 78, 50, 255))
        img = composite_pil(img, L, blur=0.7)
    return finish(img, seed=seed, warm="#FFE0A8")


def scene_campfire(w, h, seed=8):
    img = gradient(w, h, [(0, "#0B1233"), (0.45, "#1E2C66"), (0.7, "#44417F")])
    rng = np.random.default_rng(seed)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    for _ in range(140):
        x, y, r = rng.integers(0, w), rng.integers(0, int(h * 0.6)), rng.uniform(0.5, 1.6)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 240, int(rng.uniform(120, 255))))
    img = composite_pil(img, L, blur=0.4)
    img = paint_ridge(img, ridge_line(w, h * 0.64, h * 0.14, seed + 1), "#232A55", "#161B3A", seed)
    img = paint_ridge(img, ridge_line(w, h * 0.78, h * 0.10, seed + 2), "#14172F", "#0A0C1C", seed + 3)
    img = forest(img, ridge_line(w, h * 0.78, h * 0.10, seed + 2), seed + 8, "#080A18", 90, h * 0.05, h * 0.12)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    d.polygon([(w * 0.12, h * 0.9), (w * 0.28, h * 0.72), (w * 0.44, h * 0.9)], fill=(222, 124, 70, 255))
    d.polygon([(w * 0.2, h * 0.9), (w * 0.28, h * 0.78), (w * 0.34, h * 0.9)], fill=(110, 48, 30, 255))
    img = composite_pil(img, L, blur=0.8)
    img = glow(img, 0.62, 0.86, 0.42, "#FF9440", 1.6)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    for k in range(3):
        fx = w * (0.60 + k * 0.02)
        d.polygon([(fx - 16, h * 0.9), (fx, h * (0.8 - k * 0.02)), (fx + 16, h * 0.9)], fill=(255, 180 + k * 20, 70, 255))
    person(d, int(w * 0.80), int(h * 0.91), h * 0.2, (12, 10, 20, 255))
    person(d, int(w * 0.88), int(h * 0.92), h * 0.19, (12, 10, 20, 255))
    person(d, int(w * 0.42), int(h * 0.93), h * 0.18, (12, 10, 20, 255))
    img = composite_pil(img, L, blur=1.0)
    return finish(img, seed=seed, warm="#FF9A55", vignette=0.4)


def scene_family(w, h, seed=9):
    img = gradient(w, h, [(0, "#78B7E8"), (0.45, "#F6E5C0"), (0.62, "#FFD9A0")])
    img = glow(img, 0.3, 0.55, 0.5, "#FFD28A", 1.2)
    img = clouds(img, seed + 1, "#FFFFFF", 0.05, 0.45, 0.55, 0.8)
    img = paint_ridge(img, ridge_line(w, h * 0.62, h * 0.12, seed + 1, rough=0.4, octaves=4), "#9DB89A", "#C0CC9E", seed, haze="#FFE9C0")
    img = paint_ridge(img, ridge_line(w, h * 0.74, h * 0.10, seed + 2, rough=0.4, octaves=4), "#6E9A5E", "#4C7A46", seed + 2)
    near = ridge_line(w, h * 0.86, h * 0.06, seed + 3, rough=0.4, octaves=3)
    img = paint_ridge(img, near, "#3D6B3C", "#1F4125", seed + 4, tex=0.2)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    sc = (30, 24, 28, 255)
    person(d, int(w * 0.42), int(h * 0.93), h * 0.30, sc)
    person(d, int(w * 0.54), int(h * 0.93), h * 0.28, sc)
    person(d, int(w * 0.48), int(h * 0.94), h * 0.17, sc)
    round_tree(d, int(w * 0.84), int(h * 0.84), h * 0.2, (32, 92, 56, 255), (90, 150, 84, 255))
    img = composite_pil(img, L, blur=0.9)
    return finish(img, seed=seed, warm="#FFD9A0")


def scene_solo(w, h, seed=10):
    img = gradient(w, h, [(0, "#4A6FC4"), (0.35, "#E8A8B6"), (0.55, "#FFD7A0"), (0.65, "#FFF0D0")])
    img = glow(img, 0.5, 0.5, 0.5, "#FFE2A0", 1.1)
    # mar de nuvens
    for i, (y0, y1, c, dens) in enumerate([(0.45, 0.75, "#FFF3E6", 0.42), (0.6, 0.95, "#FFE0D0", 0.4), (0.78, 1.1, "#F6C9C0", 0.36)]):
        img = clouds(img, seed + i * 7, c, y0, y1, dens, 1.0)
    img = paint_ridge(img, ridge_line(w, h * 0.55, h * 0.10, seed + 1, rough=0.45, octaves=4), "#8D8BB5", "#C0B5C8", seed, haze="#FFE0C8")
    peak = ridge_line(w, h * 0.96, h * 0.2, seed + 2, rough=0.5, octaves=4) + np.abs(np.linspace(-1, 1, w) + 0.3) * h * 0.25
    img = paint_ridge(img, peak, "#4B4A62", "#201F30", seed + 3, tex=0.2)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    px = int(w * 0.35)
    person(d, px, int(peak[px]) + 6, h * 0.17, (14, 12, 22, 255))
    img = composite_pil(img, L, blur=0.8)
    return finish(img, seed=seed, warm="#FFD9A8")


def scene_snow_lake(w, h, seed=11):
    img = scene_mountain(w, h, seed=seed, snow=True, dusk=False, lake=True)
    return img



def dog(d, x, y, size, color):
    s_ = size
    d.ellipse([x - s_ * 0.5, y - s_ * 0.55, x + s_ * 0.35, y - s_ * 0.1], fill=color)            # corpo
    d.ellipse([x + s_ * 0.2, y - s_ * 0.78, x + s_ * 0.62, y - s_ * 0.38], fill=color)            # cabeça
    d.polygon([(x + s_ * 0.52, y - s_ * 0.5), (x + s_ * 0.78, y - s_ * 0.44), (x + s_ * 0.56, y - s_ * 0.36)], fill=color)  # focinho
    d.polygon([(x + s_ * 0.26, y - s_ * 0.72), (x + s_ * 0.32, y - s_ * 0.98), (x + s_ * 0.42, y - s_ * 0.72)], fill=color)  # orelha
    d.polygon([(x - s_ * 0.46, y - s_ * 0.45), (x - s_ * 0.78, y - s_ * 0.78), (x - s_ * 0.62, y - s_ * 0.38)], fill=color)  # rabo
    for lx in (-0.38, -0.12, 0.12, 0.3):
        d.rectangle([x + s_ * lx, y - s_ * 0.2, x + s_ * (lx + 0.09), y], fill=color)


def scene_care_kids(w, h, seed=61):
    img = gradient(w, h, [(0, "#79C3F0"), (0.5, "#DDF1FA"), (0.62, "#FFF3CC")])
    img = glow(img, 0.78, 0.2, 0.4, "#FFFFFF", 0.7)
    img = clouds(img, seed, "#FFFFFF", 0.05, 0.5, 0.5, 0.9)
    img = paint_ridge(img, ridge_line(w, h * 0.66, h * 0.1, seed + 1, rough=0.4, octaves=4), "#8CCB7E", "#6DB567", seed + 1)
    img = paint_ridge(img, ridge_line(w, h * 0.82, h * 0.06, seed + 2, rough=0.4, octaves=3), "#58A653", "#2F7E3F", seed + 2, tex=0.18)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    kx, ky = int(w * 0.64), int(h * 0.26)
    d.polygon([(kx, ky - 46), (kx + 32, ky), (kx, ky + 62), (kx - 32, ky)], fill=(255, 92, 92, 255))
    d.polygon([(kx, ky - 46), (kx + 32, ky), (kx, ky)], fill=(255, 205, 80, 255))
    d.polygon([(kx, ky + 62), (kx - 32, ky), (kx, ky)], fill=(80, 160, 255, 255))
    pts = [(kx, ky + 62)]
    for i in range(1, 30):
        t = i / 30
        pts.append((kx - t * w * 0.2 + math.sin(t * 9) * 14, ky + 62 + t * (h * 0.56 - 62)))
    d.line(pts, fill=(255, 255, 255, 230), width=2)
    person(d, int(w * 0.44), int(h * 0.9), h * 0.22, (40, 34, 60, 255))
    person(d, int(w * 0.34), int(h * 0.92), h * 0.14, (255, 120, 80, 255))
    for bx, by, c in ((0.16, 0.28, (255, 110, 150)), (0.24, 0.2, (255, 205, 80)), (0.1, 0.18, (110, 190, 255))):
        d.ellipse([w * bx - 22, h * by - 28, w * bx + 22, h * by + 28], fill=c + (255,))
        d.line([(w * bx, h * by + 28), (w * 0.3, h * 0.84)], fill=(255, 255, 255, 190), width=2)
    img = composite_pil(img, L, blur=0.7)
    return finish(img, seed=seed, warm="#FFE6A8")


def scene_care_seniors(w, h, seed=62):
    img = gradient(w, h, [(0, "#5A7FC0"), (0.35, "#EBB6A0"), (0.58, "#FFDCA8")])
    img = glow(img, 0.5, 0.55, 0.5, "#FFE0A0", 1.1)
    img = clouds(img, seed, "#FFE3CC", 0.08, 0.5, 0.52, 0.85)
    img = paint_ridge(img, ridge_line(w, h * 0.66, h * 0.1, seed + 1, rough=0.4, octaves=4), "#9DB38C", "#B9C69A", seed + 1, haze="#FFE3B8")
    img = paint_ridge(img, ridge_line(w, h * 0.80, h * 0.07, seed + 2, rough=0.4, octaves=3), "#5E8A55", "#3B6A3F", seed + 2, tex=0.16)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    round_tree(d, int(w * 0.8), int(h * 0.82), h * 0.3, (36, 94, 58, 255), (96, 152, 84, 255))
    bx, by = int(w * 0.34), int(h * 0.9)
    d.rectangle([bx - 70, by - 44, bx + 70, by - 34], fill=(92, 62, 44, 255))
    d.rectangle([bx - 70, by - 92, bx + 70, by - 80], fill=(92, 62, 44, 255))
    for lx in (-62, 56):
        d.rectangle([bx + lx, by - 92, bx + lx + 8, by], fill=(60, 40, 30, 255))
    sc = (36, 30, 40, 255)
    person(d, bx - 22, by - 46, h * 0.17, sc)
    person(d, bx + 26, by - 46, h * 0.16, sc)
    d.line([(bx + 56, by - 40), (bx + 56, by + 4)], fill=sc, width=4)
    img = composite_pil(img, L, blur=0.8)
    return finish(img, seed=seed, warm="#FFD9A0")


def scene_care_access(w, h, seed=63):
    img = gradient(w, h, [(0, "#6AAEE8"), (0.5, "#D6EDF8"), (0.6, "#FFF1D6")])
    img = glow(img, 0.7, 0.3, 0.4, "#FFFFFF", 0.7)
    img = clouds(img, seed, "#FFFFFF", 0.05, 0.45, 0.55, 0.85)
    img = sea_band(img, int(h * 0.52), "#6FE0D6", "#1C86A8", seed, sun_x=0.7, sun_color="#FFFFFF")
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    d.polygon([(w * 0.4, h * 0.6), (w * 0.62, h * 0.6), (w * 1.0, h), (w * 0.0, h)], fill=(226, 206, 170, 255))
    for i in range(1, 9):
        t = i / 9
        y = h * (0.6 + 0.4 * t * t)
        d.line([(w * (0.4 - 0.4 * t * t), y), (w * (0.62 + 0.38 * t * t), y)], fill=(196, 170, 130, 200), width=2)
    for side in (0.4, 0.62):
        d.line([(w * side, h * 0.6), (w * (1.0 if side > 0.5 else 0.0), h)], fill=(250, 250, 250, 255), width=5)
    sc = (30, 26, 44, 255)
    cx, cy = int(w * 0.5), int(h * 0.88)
    d.ellipse([cx - 40, cy - 56, cx + 40, cy + 24], outline=sc, width=6)   # roda
    d.ellipse([cx - 16, cy - 124, cx + 12, cy - 96], fill=sc)               # cabeça
    d.rounded_rectangle([cx - 20, cy - 96, cx + 12, cy - 38], radius=10, fill=sc)  # tronco
    d.rectangle([cx - 20, cy - 40, cx + 40, cy - 28], fill=sc)              # assento/pernas
    d.line([(cx + 40, cy - 34), (cx + 52, cy - 4)], fill=sc, width=7)
    img = composite_pil(img, L, blur=0.9)
    return finish(img, seed=seed)


def scene_care_pets(w, h, seed=64):
    img = gradient(w, h, [(0, "#6FB5EA"), (0.45, "#E6F2D8"), (0.6, "#FFF0C4")])
    img = glow(img, 0.25, 0.3, 0.4, "#FFF6C8", 1.0)
    img = clouds(img, seed, "#FFFFFF", 0.05, 0.45, 0.55, 0.8)
    img = paint_ridge(img, ridge_line(w, h * 0.62, h * 0.12, seed + 1, rough=0.4, octaves=4), "#8FB98A", "#B3CF98", seed + 1, haze="#F4F6D8")
    img = paint_ridge(img, ridge_line(w, h * 0.78, h * 0.07, seed + 2, rough=0.4, octaves=3), "#5FA05A", "#3A7A45", seed + 2, tex=0.18)
    L = layer(w, h)
    d = ImageDraw.Draw(L)
    sc = (46, 34, 30, 255)
    person(d, int(w * 0.32), int(h * 0.93), h * 0.26, (30, 36, 60, 255))
    dog(d, int(w * 0.6), int(h * 0.93), h * 0.2, sc)
    d.line([(w * 0.35, h * 0.78), (w * 0.62, h * 0.82)], fill=(220, 60, 60, 255), width=3)
    img = composite_pil(img, L, blur=0.8)
    return finish(img, seed=seed, warm="#FFE6A8")


# ---------- catálogo de saída ----------
QUIZ = {
    "clima-frio": lambda: scene_mountain(QW, QH, 21, snow=True, dusk=True, cabin=True),
    "clima-calor": lambda: scene_beach(QW, QH, 22, "turquoise", True),
    "clima-tanto-faz": lambda: scene_sunrise_hills(WW, WH, 23),
    "exp-praia": lambda: scene_beach(QW, QH, 24, "lagoon", True),
    "exp-montanha": lambda: scene_mountain(QW, QH, 25, snow=False, dusk=False, lake=True),
    "exp-cidade": lambda: scene_city(QW, QH, 26),
    "exp-natureza": lambda: scene_nature(QW, QH, 27, river=True),
    "exp-neve": lambda: scene_mountain(WW, WH, 28, snow=True, dusk=False),
    "alcance-perto": lambda: scene_sunrise_hills(WW, WH, 29),
    "alcance-brasil": lambda: scene_coast(WW, WH, 30),
    "alcance-internacional": lambda: scene_clouds(WW, WH, 31),
    "comp-casal": lambda: scene_beach(QW, QH, 32, "deep", True, sunset=True, people=True),
    "comp-amigos": lambda: scene_campfire(QW, QH, 33),
    "comp-familia": lambda: scene_family(QW, QH, 34),
    "comp-solo": lambda: scene_solo(QW, QH, 35),
    "care-criancas": lambda: scene_care_kids(QW, QH),
    "care-idosos": lambda: scene_care_seniors(QW, QH),
    "care-acessibilidade": lambda: scene_care_access(QW, QH),
    "care-pets": lambda: scene_care_pets(QW, QH),
}
DEST = {
    "maldivas": lambda: scene_beach(DW, DH, 41, "lagoon", True),
    "noronha": lambda: scene_coast(DW, DH, 42),
    "gramado": lambda: scene_mountain(DW, DH, 43, snow=False, dusk=True, cabin=True),
    "jericoacoara": lambda: scene_coast(DW, DH, 44, dune=True),
    "bariloche": lambda: scene_snow_lake(DW, DH, 45),
    "lisboa": lambda: scene_city(DW, DH, 46, dusk=True),
    "chapada": lambda: scene_nature(DW, DH, 47, river=False, golden=True),
    "rio": lambda: scene_beach(DW, DH, 48, "deep", True, sunset=True),
    "santiago": lambda: scene_mountain(DW, DH, 49, snow=True, dusk=True),
    "cancun": lambda: scene_beach(DW, DH, 50, "turquoise", True),
    "campos": lambda: scene_mountain(DW, DH, 51, snow=False, dusk=False, cabin=True),
    "bonito": lambda: scene_nature(DW, DH, 52, river=True, golden=True),
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in {**{f"q-{k}": v for k, v in QUIZ.items()}, **{f"d-{k}": v for k, v in DEST.items()}}.items():
        fn().save(OUT / f"{name}.jpg", quality=80, optimize=True, progressive=True)
        print(name)
