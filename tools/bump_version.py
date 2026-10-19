"""새 버전을 올리기 전에 실행: sw.js의 VERSION과 index.html의 파일 주소 꼬리표(?v=)를 함께 올린다.
이렇게 해야 사용자 브라우저가 옛 파일과 새 파일을 섞어 불러오지 않는다.
사용: python3 tools/bump_version.py"""
import pathlib
import re

root = pathlib.Path(__file__).resolve().parent.parent
sw = root / 'sw.js'
s = sw.read_text()
n = int(re.search(r"const VERSION = 'v(\d+)';", s).group(1)) + 1
sw.write_text(re.sub(r"const VERSION = 'v\d+';", f"const VERSION = 'v{n}';", s))

idx = root / 'index.html'
h = idx.read_text()
# 로컬 css·js 주소 뒤에 ?v=번호 붙이기 (이미 있으면 바꾸기)
h = re.sub(r'((?:src|href)="(?!https?:)[^"?]+\.(?:js|css))(?:\?v=\d+)?"', rf'\1?v={n}"', h)
idx.write_text(h)
print(f'버전 v{n}')
