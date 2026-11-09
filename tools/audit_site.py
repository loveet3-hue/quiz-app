#!/usr/bin/env python3
"""애드센스 심사 전 전수 점검: 사이트맵의 모든 페이지를 검토자 기준으로 검사하고 문제를 출력한다.
사용: python3 tools/audit_site.py   (문제가 있으면 종료 코드 1)
검사: 글 분량, 제목·설명 중복, 내부 링크 깨짐, 사이트맵과 noindex 충돌, 미완성 흔적, 처리방침 필수 문구, ads.txt"""
import collections, pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
MIN_CHARS = 300
problems = collections.defaultdict(list)
def path_of(u):
    p = re.sub(r'^https://quizbwa\.co\.kr', '', u).split('#')[0].split('?')[0]
    f = ROOT / p.lstrip('/')
    return f / 'index.html' if (p.endswith('/') or f.is_dir()) else f
def strip(h): return re.sub(r'\s+', '', re.sub(r'<script.*?</script>|<style.*?</style>|<[^>]+>', ' ', h, flags=re.S))
def content(h):
    m = re.search(r'<!--STATIC-->(.*?)<!--/STATIC-->', h, re.S)
    if m: return strip(m.group(1))
    m = re.search(r'<main.*?</main>', h, re.S)
    return strip(m.group(0) if m else h)
urls = re.findall(r'<loc>([^<]+)</loc>', (ROOT / 'sitemap.xml').read_text())
titles, descs, lengths = collections.defaultdict(list), collections.defaultdict(list), {}
for u in urls:
    f = path_of(u)
    if not f.exists(): problems['사이트맵에 있는데 파일 없음'].append(u); continue
    h = f.read_text(encoding='utf8'); head = h[:h.find('</head>')]
    t = re.search(r'<title>([^<]*)', head); d = re.search(r'name="description" content="([^"]*)', head)
    if not t or not t.group(1).strip(): problems['제목 없음'].append(u)
    else: titles[t.group(1)].append(u)
    if not d or len(d.group(1)) < 30: problems['설명 없음·짧음'].append(u)
    else: descs[d.group(1)].append(u)
    if 'noindex' in head: problems['사이트맵에 있는데 noindex'].append(u)
    if 'rel="canonical"' not in head: problems['canonical 없음'].append(u)
    n = lengths[u] = len(content(h))
    if n < MIN_CHARS and not re.search(r'/(terms|privacy|credits)', u): problems[f'글 {MIN_CHARS}자 미만'].append(f'{u} ({n})')
    txt = strip(h)
    for w in ['undefined', '[objectObject]', 'NaN원', 'lorem', '준비중', '공사중', 'TODO']:
        if w in txt: problems['미완성 흔적'].append(f'{u} ({w})')
for k, v in titles.items():
    if len(v) > 1: problems['제목 중복'].append(f'{k}: {len(v)}개')
for k, v in descs.items():
    if len(v) > 1: problems['설명 중복'].append(f'{k[:40]}…: {len(v)}개')
# 내부 링크 (사이트맵 페이지 + 소개·약관)
seen = set()
for f in [path_of(u) for u in urls] + [ROOT / x for x in ('about.html', 'terms.html', 'privacy.html', 'credits.html')]:
    if not f.exists(): continue
    for href in re.findall(r'href="(/[^"#]*)', f.read_text(encoding='utf8')):
        p = href.split('?')[0]
        if p in seen or p.startswith('//') or re.search(r'\.(css|png|webmanifest|svg|jpg|ico|xml)$', p): continue
        seen.add(p)
        if not path_of(p).exists(): problems['깨진 내부 링크'].append(f'{p} (from {f.relative_to(ROOT)})')
pv = (ROOT / 'privacy.html').read_text(encoding='utf8')
for w in ['쿠키', 'Google', '애드센스', '광고']:
    if w not in pv: problems['처리방침 필수 문구 없음'].append(w)
ads = (ROOT / 'ads.txt').read_text() if (ROOT / 'ads.txt').exists() else ''
if 'pub-3499693117852626' not in ads: problems['ads.txt 이상'].append('게시자 번호 없음')
groups = collections.defaultdict(list)
for u, n in lengths.items(): groups[(re.sub(r'https://quizbwa\.co\.kr/?', '', u).split('/') + [''])[0] or 'home'].append(n)
print(f'사이트맵 {len(urls)}개')
for g, v in sorted(groups.items(), key=lambda x: -len(x[1])): print(f'  {g:12} {len(v):3}개  글자 최소 {min(v)} · 중앙 {sorted(v)[len(v)//2]}')
for k, v in problems.items():
    print(f'\n[문제] {k}: {len(v)}건'); [print('  -', x) for x in v[:12]]
print('\n문제 없음' if not problems else f'\n문제 종류 {len(problems)}개')
sys.exit(1 if problems else 0)
