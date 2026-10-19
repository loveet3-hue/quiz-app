// 목록 카드 썸네일 그림. 사진이 없는 퀴즈는 주제에 맞는 그림을 코드로 직접 그린다 (저작권 걱정 없음).
// 모든 그림은 400×300 판 위에, 가운데 240×200 안쪽에만 그려서 카드에서 잘리지 않게 한다.

const COVERS = (() => {
  const KO = "'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif";
  const NUM = "'Arial Rounded MT Bold','Arial',sans-serif";

  const make = (c1, c2, body) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#g)"/>
      <circle cx="30" cy="30" r="80" fill="#fff" opacity=".22"/>
      <circle cx="385" cy="285" r="95" fill="#fff" opacity=".16"/>
      <circle cx="360" cy="40" r="14" fill="#fff" opacity=".35"/>
      ${body}
    </svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  // 그림자 하나로 통일 (살짝 떠 보이게)
  const shadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${rx * 0.12}" fill="#000" opacity=".10"/>`;

  return {
    // 사자성어: 족자
    idioms: make('#efe7ff', '#c8b4ff', `
      ${shadow(200, 262, 70)}
      <rect x="138" y="44" width="124" height="14" rx="7" fill="#6b4f3a"/>
      <rect x="146" y="56" width="108" height="186" fill="#fffaf0"/>
      <rect x="146" y="56" width="108" height="186" fill="none" stroke="#e9dcc3" stroke-width="3"/>
      <rect x="138" y="240" width="124" height="14" rx="7" fill="#6b4f3a"/>
      <g font-family="'Songti SC','Apple Myungjo','Noto Serif KR',serif" font-size="34" font-weight="700" fill="#2b2233" text-anchor="middle">
        <text x="200" y="98">一</text><text x="200" y="140">石</text><text x="200" y="182">二</text><text x="200" y="224">鳥</text>
      </g>
      <circle cx="236" cy="226" r="9" fill="#e5484d" opacity=".85"/>`),

    // 수도: 지구본 + 위치 핀
    capitals: make('#ffe6d9', '#ffbf9f', `
      ${shadow(190, 258, 72)}
      <circle cx="190" cy="160" r="82" fill="#4f8cff"/>
      <path d="M142 112c18-8 34-4 40 8s-6 20 4 30 26 4 30 18-14 26-30 28-22 14-34 6-8-24-20-30-18-20-8-34 6-20 18-26z" fill="#7ed99a"/>
      <path d="M226 96c14 2 28 14 30 28s-10 12-20 10-18 4-24-6 0-34 14-32z" fill="#7ed99a"/>
      <path d="M232 196c10-4 22 2 22 12s-12 18-22 16-12-24 0-28z" fill="#7ed99a"/>
      <circle cx="190" cy="160" r="82" fill="none" stroke="#2f64d6" stroke-width="5"/>
      <path d="M262 58c-22 0-38 16-38 37 0 28 38 62 38 62s38-34 38-62c0-21-16-37-38-37z" fill="#ff5a5f"/>
      <circle cx="262" cy="94" r="14" fill="#fff"/>`),

    // 넌센스: 물음표 전구
    nonsense: make('#fff6cf', '#ffd68f', `
      ${shadow(200, 266, 50)}
      <g stroke="#ffb020" stroke-width="7" stroke-linecap="round">
        <line x1="200" y1="30" x2="200" y2="48"/><line x1="122" y1="62" x2="135" y2="75"/><line x1="278" y1="62" x2="265" y2="75"/>
        <line x1="96" y1="132" x2="114" y2="132"/><line x1="304" y1="132" x2="286" y2="132"/>
      </g>
      <path d="M200 62c-42 0-72 30-72 68 0 26 14 42 28 56 8 8 12 16 12 26h64c0-10 4-18 12-26 14-14 28-30 28-56 0-38-30-68-72-68z" fill="#ffd93d" stroke="#f0a500" stroke-width="5"/>
      <rect x="166" y="214" width="68" height="16" rx="6" fill="#8d8aa0"/>
      <rect x="170" y="232" width="60" height="14" rx="6" fill="#6f6c82"/>
      <rect x="182" y="248" width="36" height="10" rx="5" fill="#5a5770"/>
      <text x="200" y="168" font-family="${NUM}" font-size="78" font-weight="700" fill="#7a4b00" text-anchor="middle">?</text>`),

    // 음식: 떡볶이 그릇
    foods: make('#ffe3df', '#ffb4a2', `
      ${shadow(200, 262, 98)}
      <g stroke="#fff" stroke-width="7" stroke-linecap="round" fill="none" opacity=".9">
        <path d="M160 92c-10-12 10-22 0-36"/><path d="M200 86c-10-12 10-22 0-36"/><path d="M240 92c-10-12 10-22 0-36"/>
      </g>
      <path d="M100 150h200a100 92 0 0 1-200 0z" fill="#3e6fd8"/>
      <path d="M112 176h176" stroke="#fff" stroke-width="5" opacity=".5"/>
      <ellipse cx="200" cy="150" rx="100" ry="22" fill="#d93a26"/>
      <g fill="#fff4e3" stroke="#c22d1a" stroke-width="2">
        <rect x="128" y="136" width="54" height="16" rx="8" transform="rotate(-12 155 144)"/>
        <rect x="176" y="128" width="54" height="16" rx="8" transform="rotate(8 203 136)"/>
        <rect x="214" y="142" width="54" height="16" rx="8" transform="rotate(-6 241 150)"/>
      </g>
      <ellipse cx="186" cy="154" rx="16" ry="11" fill="#fff"/><circle cx="186" cy="154" r="6" fill="#ffc533"/>`),

    // 속담: 펼친 책 + 빈칸
    proverbs: make('#dcebff', '#a7c9ff', `
      ${shadow(200, 252, 112)}
      <path d="M200 84c-30-14-66-16-100-8v150c34-8 70-6 100 8z" fill="#fff"/>
      <path d="M200 84c30-14 66-16 100-8v150c-34-8-70-6-100 8z" fill="#f4f8ff"/>
      <path d="M200 84v150" stroke="#9ab4e6" stroke-width="3"/>
      <g stroke="#c9d6ee" stroke-width="5" stroke-linecap="round">
        <line x1="118" y1="110" x2="182" y2="114"/><line x1="118" y1="132" x2="182" y2="136"/><line x1="118" y1="154" x2="170" y2="157"/>
        <line x1="118" y1="176" x2="182" y2="180"/><line x1="118" y1="198" x2="160" y2="200"/>
        <line x1="218" y1="114" x2="282" y2="110"/><line x1="218" y1="180" x2="282" y2="176"/><line x1="218" y1="202" x2="266" y2="199"/>
      </g>
      <rect x="216" y="128" width="68" height="36" rx="8" fill="#ffe066" stroke="#f5b400" stroke-width="3" stroke-dasharray="7 5"/>
      <text x="250" y="155" font-family="${NUM}" font-size="26" font-weight="700" fill="#b07d00" text-anchor="middle">?</text>`),

    // 영어: ABC 블록
    english: make('#d9fbea', '#9eefcf', `
      ${shadow(200, 252, 120)}
      ${[['A', 92, 160, '#ff6b6b', '#d94c4c'], ['B', 165, 120, '#4f8cff', '#2f64d6'], ['C', 238, 160, '#ffb020', '#d98c00']]
        .map(([l, x, y, c, d]) => `<rect x="${x}" y="${y + 8}" width="72" height="72" rx="14" fill="${d}"/><rect x="${x}" y="${y}" width="72" height="72" rx="14" fill="${c}"/>
          <text x="${x + 36}" y="${y + 52}" font-family="${NUM}" font-size="44" font-weight="700" fill="#fff" text-anchor="middle">${l}</text>`).join('')}`),

    // 암산: 계산기
    'mental-math': make('#e8ebf3', '#c2cde2', `
      ${shadow(200, 264, 80)}
      <rect x="128" y="40" width="144" height="216" rx="20" fill="#2d3142"/>
      <rect x="144" y="56" width="112" height="46" rx="8" fill="#c9f2d7"/>
      <text x="246" y="90" font-family="${NUM}" font-size="28" font-weight="700" fill="#1f5137" text-anchor="end">7×8=?</text>
      ${[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => `<rect x="${146 + c * 38}" y="${114 + r * 34}" width="30" height="26" rx="7" fill="${c === 2 ? '#ff8c42' : '#4b5066'}"/>`).join('')).join('')}`),

    // 원소: 주기율표 칸
    elements: make('#ede8ff', '#c5b6fd', `
      ${shadow(200, 262, 90)}
      <g transform="rotate(-10 86 120)"><rect x="54" y="88" width="64" height="64" rx="10" fill="#fff" opacity=".75"/><text x="86" y="132" font-family="${NUM}" font-size="32" font-weight="700" fill="#8f7ad6" text-anchor="middle">H</text></g>
      <g transform="rotate(10 314 114)"><rect x="282" y="82" width="64" height="64" rx="10" fill="#fff" opacity=".75"/><text x="314" y="126" font-family="${NUM}" font-size="32" font-weight="700" fill="#8f7ad6" text-anchor="middle">O</text></g>
      <rect x="128" y="88" width="144" height="160" rx="16" fill="#fff" stroke="#6c5ce7" stroke-width="6"/>
      <text x="146" y="120" font-family="${NUM}" font-size="22" font-weight="700" fill="#6c5ce7">26</text>
      <text x="200" y="192" font-family="${NUM}" font-size="66" font-weight="700" fill="#2b2233" text-anchor="middle">Fe</text>
      <text x="200" y="230" font-family="${KO}" font-size="22" font-weight="800" fill="#6f6a85" text-anchor="middle">철</text>`),

    // 역사: 전통 성문
    history: make('#f7ead9', '#e2c49f', `
      ${shadow(200, 252, 116)}
      <path d="M134 98q66-30 132 0l-10 12q-56-22-112 0z" fill="#3b2f2f"/>
      <rect x="160" y="108" width="80" height="22" fill="#b5523b"/>
      <path d="M96 140q104-40 208 0l-14 16q-90-30-180 0z" fill="#3b2f2f"/>
      <rect x="118" y="154" width="164" height="12" fill="#2f8f6f"/>
      ${[130, 170, 222, 262].map((x) => `<rect x="${x}" y="166" width="10" height="44" fill="#b5523b"/>`).join('')}
      <rect x="100" y="206" width="200" height="40" rx="4" fill="#a68a6d"/>
      <path d="M180 246v-18a20 20 0 0 1 40 0v18z" fill="#3b2f2f"/>
      <g stroke="#8c7257" stroke-width="2"><line x1="100" y1="226" x2="180" y2="226"/><line x1="220" y1="226" x2="300" y2="226"/></g>`),

    // 도시: 빌딩 + 핀
    cities: make('#d8edff', '#9ccfff', `
      ${shadow(200, 252, 120)}
      ${[[88, 150, 44, '#5b8def'], [136, 112, 48, '#3f6fd1'], [188, 136, 40, '#6aa0ff'], [232, 96, 50, '#2f5bb8'], [286, 160, 30, '#5b8def']]
        .map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${248 - y}" rx="4" fill="${c}"/>` +
          Array.from({ length: Math.floor((236 - y) / 22) }, (_, i) => `<rect x="${x + 9}" y="${y + 12 + i * 22}" width="${w - 18}" height="8" rx="2" fill="#fff" opacity=".55"/>`).join('')).join('')}
      <rect x="80" y="244" width="244" height="8" rx="4" fill="#2a4a8a"/>
      <path d="M257 36c-18 0-32 13-32 30 0 23 32 50 32 50s32-27 32-50c0-17-14-30-32-30z" fill="#ff5a5f"/>
      <circle cx="257" cy="66" r="11" fill="#fff"/>`),

    // 맞춤법: 빨간 펜 채점
    spelling: make('#ffe6df', '#ffbba8', `
      ${shadow(200, 256, 100)}
      <g transform="rotate(-4 200 150)">
        <rect x="104" y="64" width="192" height="176" rx="12" fill="#fff"/>
        <g stroke="#ffd2c6" stroke-width="2"><line x1="104" y1="100" x2="296" y2="100"/><line x1="104" y1="200" x2="296" y2="200"/></g>
        <text x="152" y="166" font-family="${KO}" font-size="36" font-weight="800" fill="#a29db3" text-anchor="middle">금새</text>
        <line x1="118" y1="154" x2="186" y2="154" stroke="#e5484d" stroke-width="5" stroke-linecap="round"/>
        <text x="250" y="166" font-family="${KO}" font-size="36" font-weight="800" fill="#2b2233" text-anchor="middle">금세</text>
        <ellipse cx="250" cy="153" rx="44" ry="30" fill="none" stroke="#e5484d" stroke-width="5"/>
        <path d="M232 214l12 12 24-26" fill="none" stroke="#e5484d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`),

    // 반대말: 서로 반대 방향 화살표
    antonyms: make('#d4f8ec', '#93ecd3', `
      ${shadow(200, 256, 100)}
      <path d="M96 104h150v-30l64 50-64 50v-30h-150z" fill="#ff8c42"/>
      <path d="M304 196h-150v-30l-64 50 64 50v-30h150z" fill="#13a89e"/>
      <text x="160" y="138" font-family="${KO}" font-size="24" font-weight="800" fill="#fff" text-anchor="middle">크다</text>
      <text x="236" y="230" font-family="${KO}" font-size="24" font-weight="800" fill="#fff" text-anchor="middle">작다</text>`),

    // 동물 새끼: 알에서 나온 병아리
    'baby-animals': make('#fff4c8', '#ffd585', `
      ${shadow(200, 262, 80)}
      <circle cx="200" cy="136" r="62" fill="#ffd93d"/>
      <path d="M186 84c4-16 20-20 22-6" fill="none" stroke="#f0b400" stroke-width="6" stroke-linecap="round"/>
      <circle cx="180" cy="128" r="8" fill="#2b2233"/><circle cx="220" cy="128" r="8" fill="#2b2233"/>
      <circle cx="183" cy="125" r="2.5" fill="#fff"/><circle cx="223" cy="125" r="2.5" fill="#fff"/>
      <path d="M190 146l10 14 10-14z" fill="#ff8c1a"/>
      <circle cx="166" cy="152" r="9" fill="#ff9aa2" opacity=".6"/><circle cx="234" cy="152" r="9" fill="#ff9aa2" opacity=".6"/>
      <path d="M124 176l18 -16 18 16 20 -18 20 18 20 -18 20 18 18 -16 18 16v34a76 56 0 0 1-152 0z" fill="#fff" stroke="#efe3cf" stroke-width="3"/>`),

    // 줄임말: 말풍선 대화
    slang: make('#ffe2f1', '#ffb0d6', `
      ${shadow(200, 256, 104)}
      <path d="M96 70h148a18 18 0 0 1 18 18v50a18 18 0 0 1-18 18h-110l-26 22 4-22h-16a18 18 0 0 1-18-18v-50a18 18 0 0 1 18-18z" fill="#fff"/>
      <text x="170" y="126" font-family="${KO}" font-size="34" font-weight="800" fill="#2b2233" text-anchor="middle">별다줄</text>
      <path d="M200 166h104a18 18 0 0 1 18 18v38a18 18 0 0 1-18 18h-12l4 20-24-20h-72a18 18 0 0 1-18-18v-38a18 18 0 0 1 18-18z" fill="#e84393"/>
      <text x="252" y="214" font-family="${KO}" font-size="30" font-weight="800" fill="#fff" text-anchor="middle">ㅇㅈ</text>`),

    // 규칙 찾기: 숫자 타일
    sequence: make('#dfe6ff', '#a9b9ff', `
      ${shadow(200, 214, 150)}
      ${['1', '1', '2', '3', '?'].map((n, i) => {
        const x = 52 + i * 62, last = i === 4;
        return `<rect x="${x}" y="${last ? 112 : 120}" width="52" height="${last ? 76 : 60}" rx="12" fill="${last ? '#ffcc33' : '#fff'}" ${last ? 'stroke="#f0a500" stroke-width="4"' : ''}/>
          <text x="${x + 26}" y="${last ? 164 : 162}" font-family="${NUM}" font-size="${last ? 40 : 32}" font-weight="700" fill="${last ? '#7a4b00' : '#3f51b5'}" text-anchor="middle">${n}</text>`;
      }).join('')}
      <path d="M88 96q30-22 62 0M150 96q30-22 62 0M212 96q30-22 62 0" fill="none" stroke="#3f51b5" stroke-width="4" stroke-linecap="round" opacity=".5"/>`),

    // 연예인: 마이크 + 조명
    celebs: make('#ffe3ec', '#ffa9c6', `
      ${shadow(200, 262, 70)}
      <path d="M200 40l-90 210h180z" fill="#fff" opacity=".35"/>
      <g fill="#ffd93d">
        <path d="M110 70l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2z"/>
        <path d="M296 90l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z"/>
        <path d="M282 196l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z"/>
      </g>
      <rect x="192" y="160" width="16" height="70" rx="6" fill="#2d3142"/>
      <rect x="160" y="236" width="80" height="12" rx="6" fill="#2d3142"/>
      <path d="M170 150a30 30 0 0 0 60 0" fill="none" stroke="#2d3142" stroke-width="7" stroke-linecap="round"/>
      <rect x="176" y="74" width="48" height="90" rx="24" fill="#4b5066"/>
      <rect x="176" y="74" width="48" height="56" rx="24" fill="#8a90a8"/>
      <g stroke="#4b5066" stroke-width="3" opacity=".6"><line x1="182" y1="92" x2="218" y2="92"/><line x1="180" y1="106" x2="220" y2="106"/><line x1="182" y1="120" x2="218" y2="120"/></g>`),

    // 영화: 슬레이트 + 필름
    movies: make('#e3e6ff', '#aab3ff', `
      ${shadow(200, 262, 110)}
      <g transform="rotate(8 250 150)">
        <rect x="200" y="70" width="110" height="170" rx="8" fill="#2d3142"/>
        ${Array.from({ length: 7 }, (_, i) => `<rect x="207" y="${80 + i * 22}" width="12" height="12" rx="2" fill="#fff" opacity=".8"/><rect x="291" y="${80 + i * 22}" width="12" height="12" rx="2" fill="#fff" opacity=".8"/>`).join('')}
        <rect x="226" y="82" width="58" height="60" rx="4" fill="#ffcc33" opacity=".85"/>
        <rect x="226" y="152" width="58" height="60" rx="4" fill="#ff6b6b" opacity=".85"/>
      </g>
      <rect x="92" y="128" width="150" height="104" rx="10" fill="#2d3142"/>
      <g transform="rotate(-14 92 104)">
        <rect x="92" y="96" width="150" height="28" rx="6" fill="#2d3142"/>
        ${[0, 1, 2, 3, 4].map((i) => `<path d="M${104 + i * 28} 96h14l-10 28h-14z" fill="#fff"/>`).join('')}
      </g>
      ${[0, 1, 2, 3, 4].map((i) => `<path d="M${104 + i * 28} 128h14l-10 22h-14z" fill="#fff"/>`).join('')}
      <g stroke="#fff" stroke-width="3" opacity=".5"><line x1="104" y1="176" x2="230" y2="176"/><line x1="104" y1="204" x2="230" y2="204"/></g>
      <text x="167" y="198" font-family="${KO}" font-size="22" font-weight="800" fill="#fff" text-anchor="middle" opacity=".9">TAKE 1</text>`),

    // 스트리머·유튜버: 방송 화면 + 재생 버튼 + 채팅
    streamers: make('#ffe1e1', '#ff9f9f', `
      ${shadow(200, 262, 110)}
      <rect x="84" y="64" width="190" height="130" rx="16" fill="#2d3142"/>
      <rect x="96" y="76" width="166" height="106" rx="8" fill="#ff4f5e"/>
      <path d="M166 106v46l40-23z" fill="#fff"/>
      <circle cx="108" cy="88" r="5" fill="#fff"/><text x="118" y="93" font-family="${NUM}" font-size="13" font-weight="700" fill="#fff">LIVE</text>
      <rect x="160" y="194" width="38" height="22" fill="#2d3142"/>
      <rect x="128" y="214" width="102" height="12" rx="6" fill="#2d3142"/>
      <rect x="250" y="120" width="96" height="34" rx="12" fill="#fff"/>
      <rect x="262" y="132" width="56" height="10" rx="5" fill="#ffb3b9"/>
      <rect x="236" y="164" width="110" height="34" rx="12" fill="#fff"/>
      <rect x="248" y="176" width="72" height="10" rx="5" fill="#c9d0ff"/>`),

    // 시계
    clock: make('#ebe6ff', '#cbbcff', `
      ${shadow(200, 264, 84)}
      <circle cx="200" cy="148" r="100" fill="#fff" stroke="#2b2233" stroke-width="10"/>
      ${Array.from({ length: 12 }, (_, i) => {
        const r = (i * 30 * Math.PI) / 180;
        return `<line x1="${(200 + 80 * Math.sin(r)).toFixed(1)}" y1="${(148 - 80 * Math.cos(r)).toFixed(1)}" x2="${(200 + 90 * Math.sin(r)).toFixed(1)}" y2="${(148 - 90 * Math.cos(r)).toFixed(1)}" stroke="#8f8aa3" stroke-width="${i % 3 === 0 ? 6 : 3}" stroke-linecap="round"/>`;
      }).join('')}
      <line x1="200" y1="148" x2="160" y2="110" stroke="#2b2233" stroke-width="10" stroke-linecap="round"/>
      <line x1="200" y1="148" x2="262" y2="104" stroke="#7c5cff" stroke-width="7" stroke-linecap="round"/>
      <circle cx="200" cy="148" r="9" fill="#2b2233"/>`),
  };
})();
