"""앱 아이콘(PNG) 생성 스크립트. 한 번만 실행하면 icons/ 폴더에 만들어진다."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
FONT = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
TOP = (124, 92, 255)     # 보라
BOTTOM = (255, 107, 129)  # 코랄


def make(size: int, path: Path, padded: bool = False) -> None:
    img = Image.new("RGB", (size, size))
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / (size - 1)
        color = tuple(round(TOP[i] + (BOTTOM[i] - TOP[i]) * t) for i in range(3))
        draw.line([(0, y), (size, y)], fill=color)

    # 말풍선 + 물음표
    scale = 0.78 if padded else 1.0
    bubble = size * 0.56 * scale
    cx, cy = size / 2, size / 2 - size * 0.02
    draw.rounded_rectangle(
        [cx - bubble / 2, cy - bubble / 2, cx + bubble / 2, cy + bubble / 2],
        radius=bubble * 0.32,
        fill="white",
    )
    tail = bubble * 0.16
    draw.polygon(
        [
            (cx - bubble * 0.18, cy + bubble / 2 - 2),
            (cx + bubble * 0.02, cy + bubble / 2 - 2),
            (cx - bubble * 0.22, cy + bubble / 2 + tail),
        ],
        fill="white",
    )
    font = ImageFont.truetype(FONT, round(bubble * 0.72))
    draw.text((cx, cy + bubble * 0.02), "?", font=font, fill=TOP, anchor="mm")
    img.save(path)


if __name__ == "__main__":
    out = HERE / "icons"
    out.mkdir(exist_ok=True)
    make(192, out / "icon-192.png")
    make(512, out / "icon-512.png")
    make(512, out / "icon-maskable-512.png", padded=True)
    make(180, out / "apple-touch-icon.png")
    print("아이콘 생성 완료:", out)
