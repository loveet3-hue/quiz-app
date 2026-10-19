"""영어 위키백과 문서의 대표 사진을 한 번에 가져오고, 위키미디어 공용에서 저작권·작가를 확인.
입력: 'id|영문 문서 제목' 한 줄씩. 출력: JSON {id: {file, lic, artist, thumb}}"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request

UA = {"User-Agent": "quiz-app-check/0.1 (personal project)"}
OK = ("public domain", "cc0", "pd", "cc by")


def call(base, params):
    params = {"format": "json", **params}
    for attempt in range(5):
        try:
            req = urllib.request.Request(base + "?" + urllib.parse.urlencode(params), headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=40))
        except urllib.error.HTTPError as e:
            if e.code != 429:
                raise
            time.sleep(10 * (attempt + 1))
    raise RuntimeError("429 계속됨")


def main(src, dst):
    rows = [tuple(s.strip() for s in l.split("|", 1)) for l in open(src, encoding="utf-8") if "|" in l]
    titles = {t: k for k, t in rows}
    data = call("https://en.wikipedia.org/w/api.php", {
        "action": "query", "prop": "pageimages", "piprop": "name", "redirects": "1",
        "titles": "|".join(titles),
    })
    q = data["query"]
    back = {}
    for n in q.get("normalized", []) + q.get("redirects", []):
        back[n["to"]] = back.get(n["from"], n["from"])
    files = {}
    for p in q["pages"].values():
        orig = p["title"]
        while orig in back:
            orig = back[orig]
        if "pageimage" in p and orig in titles:
            files[titles[orig]] = p["pageimage"]
    time.sleep(2)
    names = list(set(files.values()))
    meta = {}
    for i in range(0, len(names), 40):
        d = call("https://commons.wikimedia.org/w/api.php", {
            "action": "query", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": "320",
            "iiextmetadatafilter": "LicenseShortName|Artist",
            "titles": "|".join("File:" + n for n in names[i:i + 40]),
        })
        norm = {x["to"]: x["from"] for x in d["query"].get("normalized", [])}
        for p in d["query"]["pages"].values():
            t = norm.get(p["title"], p["title"])[5:]
            if "imageinfo" not in p:
                meta[t] = None
                continue
            ii = p["imageinfo"][0]
            em = ii.get("extmetadata", {})
            artist = re.sub(r"<[^>]+>", "", html.unescape(em.get("Artist", {}).get("value", ""))).strip()
            meta[t] = {"lic": em.get("LicenseShortName", {}).get("value", ""), "artist": re.sub(r"\s+", " ", artist)[:60],
                       "thumb": ii.get("thumburl", "").split("?")[0], "w": ii["width"], "h": ii["height"]}
        time.sleep(2)
    out = {}
    for k, _ in rows:
        f = files.get(k)
        m = meta.get(f.replace("_", " ")) if f else None
        if m is None and f:
            m = meta.get(f)
        out[k] = {"file": f.replace("_", " ") if f else None, **(m or {})}
        ok = bool(m) and m["lic"].lower().startswith(OK)
        print(("OK " if ok else "-- ") + k.ljust(8), (m or {}).get("lic", "없음").ljust(16), (f or "")[:55], "|", (m or {}).get("artist", ""))
    json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
