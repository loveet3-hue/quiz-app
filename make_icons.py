"""앱 아이콘(PNG) 생성 스크립트. 실행하면 icons/ 폴더에 만들어진다.
로고: 보라→분홍 그라데이션 위에 흰 말풍선 + 물음표, 오른쪽 위에 초록 정답 체크.
'물어보고(?) → 맞힌다(✓)'를 한 그림에 담았다. 같은 모양의 벡터판은 icons/logo.svg."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).parent
FONT = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"
C1 = (124, 92, 255)   # #7C5CFF 보라
C2 = (255, 107, 154)  # #FF6B9A 분홍
INK = (77, 50, 230)   # #4D32E6 물음표
OK = (34, 197, 94)    # #22C55E 체크
SS = 4                # 4배로 그린 뒤 줄여서 가장자리를 매끄럽게


def make(size: int, path: Path, padded: bool = False) -> None:
    S = size * SS
    img = Image.new("RGB", (S, S))
    px = img.load()
    for y in range(S):
        for x in range(0, S, 4):
            t = (x + y) / (2 * (S - 1))  # 왼쪽 위 → 오른쪽 아래 대각선
            c = tuple(round(C1[i] + (C2[i] - C1[i]) * t) for i in range(3))
            for k in range(4):
                if x + k < S:
                    px[x + k, y] = c
    d = ImageDraw.Draw(img)

    k = 0.74 if padded else 1.0  # 마스크용은 가운데로 모음
    u = S * k / 100              # 100칸 기준 좌표
    ox = oy = S * (1 - k) / 2

    def P(x, y):
        return (ox + x * u, oy + y * u)

    # 말풍선 (꼬리는 왼쪽 아래)
    d.rounded_rectangle([P(20, 22), P(78, 72)], radius=16 * u, fill="white")
    d.polygon([P(30, 66), P(46, 66), P(26, 84)], fill="white")
    # 물음표
    font = ImageFont.truetype(FONT, round(44 * u))
    d.text(P(49, 48), "?", font=font, fill=INK, anchor="mm")
    # 정답 체크 배지
    d.ellipse([P(64, 12), P(90, 38)], fill="white")
    d.ellipse([P(67, 15), P(87, 35)], fill=OK)
    d.line([P(72, 25.5), P(76, 29.5), P(82.5, 20.5)], fill="white", width=round(3.6 * u), joint="curve")

    img.resize((size, size), Image.LANCZOS).save(path)


if __name__ == "__main__":
    out = HERE / "icons"
    out.mkdir(exist_ok=True)
    make(192, out / "icon-192.png")
    make(512, out / "icon-512.png")
    make(512, out / "icon-maskable-512.png", padded=True)
    make(180, out / "apple-touch-icon.png")
    make(1024, out / "icon-1024.png")  # 스토어 등록용
    print("아이콘 생성 완료:", out)
