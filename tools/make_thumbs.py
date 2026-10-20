"""목록 카드 표지용 작은 사진 만들기 → thumbs/<퀴즈id>.webp, thumbs/flag-<코드>.webp
바깥 사진을 매번 위키미디어에서 받아오면 표지가 늦게 떠서, 작게 줄여 사이트에 직접 둔다.
사용: python3 tools/make_thumbs.py   (표지 사진을 바꾸거나 사진 표지 퀴즈를 추가하면 다시 실행)"""
import io
import subprocess
import urllib.request
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "thumbs"
OUT.mkdir(exist_ok=True)
NODE = str(Path.home() / ".local/node-v22.11.0-darwin-arm64/bin/node")
UA = {"User-Agent": "quizbwa-thumbs/0.1 (https://quizbwa.co.kr)"}


def fetch(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def save(data, name, width):
    im = Image.open(io.BytesIO(data))
    im = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(OUT / f"{name}.webp", "WEBP", quality=80, method=6)
    return (OUT / f"{name}.webp").stat().st_size


lines = subprocess.run([NODE, str(ROOT / "tools/list_covers.js"), str(ROOT)], capture_output=True, text=True, check=True).stdout.splitlines()
for line in lines:
    qid, kind, val = line.split(" ", 2)
    if kind == "IMG":
        url = val.replace("width=640", "width=500")
        print(qid, save(fetch(url), qid, 480))
    else:
        for c in val.split(","):
            print("flag", c, save(fetch(f"https://flagcdn.com/w320/{c}.png"), f"flag-{c}", 320))
