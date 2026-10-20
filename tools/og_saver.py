"""카톡·SNS 미리보기 이미지 저장 서버. 브라우저(tools/og.html)가 그린 그림을 받아 og/<이름>.jpg 로 저장한다.
사용: python3 tools/og_saver.py 8791 og   → 그다음 http://localhost:8780/tools/og.html 열기 (?only=flags,cars 로 일부만)
그리고 node tools/build_pages.js 로 페이지를 다시 만든다."""
import base64
import json
import re
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)


class H(BaseHTTPRequestHandler):
    def cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204)
        self.cors()
        self.end_headers()

    def do_GET(self):
        # /img?u=<주소> : 바깥 사진을 대신 받아서 돌려줌 (브라우저 그림판 보안 정책 우회용, 위키미디어·flagcdn만)
        from urllib.parse import urlparse, parse_qs
        import urllib.request
        q = parse_qs(urlparse(self.path).query)
        u = q.get("u", [""])[0]
        host = urlparse(u).hostname or ""
        if not (host.endswith("wikimedia.org") or host == "flagcdn.com"):
            self.send_response(400); self.cors(); self.end_headers(); return
        req = urllib.request.Request(u, headers={"User-Agent": "quiz-app-og/0.1 (personal project)"})
        data = urllib.request.urlopen(req, timeout=30).read()
        self.send_response(200)
        self.cors()
        self.send_header("Content-Type", "image/jpeg")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        name = body.get("name", "")
        if not re.fullmatch(r"[\w-]{1,60}", name):
            self.send_response(400)
            self.cors()
            self.end_headers()
            return
        import io
        from PIL import Image
        data = base64.b64decode(body["png"].split(",", 1)[1])
        Image.open(io.BytesIO(data)).convert("RGB").save(OUT / f"{name}.jpg", "JPEG", quality=86, optimize=True, progressive=True)
        self.send_response(200)
        self.cors()
        self.end_headers()
        self.wfile.write(b"ok")

    def log_message(self, *a):
        pass


HTTPServer(("127.0.0.1", int(sys.argv[1])), H).serve_forever()
