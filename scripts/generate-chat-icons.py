"""Gera os ícones PNG (preto, fundo transparente, 96x96) da tela de chat. Sem SVG: usar com tintColor no app."""
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parent.parent / "assets" / "images" / "chat"
S, K = 96, 8  # tamanho final e fator de supersampling
W = S * K


def canvas():
    img = Image.new("RGBA", (W, W), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def p(*xy):
    return [v * K for v in xy]


def save(img, name):
    OUT.mkdir(parents=True, exist_ok=True)
    img.resize((S, S), Image.LANCZOS).save(OUT / f"{name}.png", optimize=True)


def send():
    img, d = canvas()
    d.polygon([(a * K, b * K) for a, b in [(14, 14), (84, 48), (14, 82), (24, 54), (52, 48), (24, 42)]], fill="black")
    save(img, "send")


def mic():
    img, d = canvas()
    d.rounded_rectangle(p(34, 12, 62, 56), radius=14 * K, fill="black")
    d.arc(p(22, 30, 74, 74), 0, 180, fill="black", width=6 * K)
    d.rectangle(p(45, 72, 51, 86), fill="black")
    d.rounded_rectangle(p(34, 84, 62, 89), radius=2 * K, fill="black")
    save(img, "mic")


def camera():
    img, d = canvas()
    d.rounded_rectangle(p(10, 26, 86, 78), radius=10 * K, fill="black")
    d.polygon([(a * K, b * K) for a, b in [(32, 26), (38, 16), (58, 16), (64, 26)]], fill="black")
    d.ellipse(p(32, 36, 64, 68), fill=(0, 0, 0, 0))
    d.ellipse(p(38, 42, 58, 62), fill="black")
    save(img, "camera")


def gallery():
    img, d = canvas()
    d.rounded_rectangle(p(10, 16, 86, 80), radius=10 * K, fill="black")
    d.rounded_rectangle(p(16, 22, 80, 74), radius=5 * K, fill=(0, 0, 0, 0))
    d.polygon([(a * K, b * K) for a, b in [(18, 70), (38, 44), (52, 60), (62, 50), (78, 70)]], fill="black")
    d.ellipse(p(56, 28, 70, 42), fill="black")
    save(img, "gallery")


def play():
    img, d = canvas()
    d.polygon([(a * K, b * K) for a, b in [(28, 16), (28, 80), (80, 48)]], fill="black")
    save(img, "play")


def pause():
    img, d = canvas()
    d.rounded_rectangle(p(22, 16, 40, 80), radius=4 * K, fill="black")
    d.rounded_rectangle(p(56, 16, 74, 80), radius=4 * K, fill="black")
    save(img, "pause")


def stop():
    img, d = canvas()
    d.rounded_rectangle(p(22, 22, 74, 74), radius=8 * K, fill="black")
    save(img, "stop")


if __name__ == "__main__":
    for fn in (send, mic, camera, gallery, play, pause, stop):
        fn()
