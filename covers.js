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

    // 연예인 사진: 폴라로이드 + 실루엣 + 물음표
    'celeb-photos': make('#ffe6f0', '#ffb3d1', `
      ${shadow(200, 262, 96)}
      <g transform="rotate(-8 150 150)">
        <rect x="88" y="62" width="120" height="146" rx="6" fill="#fff"/>
        <rect x="98" y="72" width="100" height="100" fill="#ffd1e3"/>
        <circle cx="148" cy="108" r="20" fill="#e97aa6"/>
        <path d="M112 172c4-24 18-36 36-36s32 12 36 36z" fill="#e97aa6"/>
      </g>
      <g transform="rotate(7 252 146)">
        <rect x="192" y="60" width="120" height="146" rx="6" fill="#fff"/>
        <rect x="202" y="70" width="100" height="100" fill="#d9d4ff"/>
        <circle cx="252" cy="106" r="20" fill="#8f7ad6"/>
        <path d="M216 170c4-24 18-36 36-36s32 12 36 36z" fill="#8f7ad6"/>
        <circle cx="290" cy="80" r="16" fill="#ffcc33"/>
        <text x="290" y="88" font-family="${NUM}" font-size="22" font-weight="700" fill="#7a4b00" text-anchor="middle">?</text>
      </g>`),

    // 게임 캐릭터: 게임 패드
    'game-chars': make('#e0f2ff', '#9fd4ff', `
      ${shadow(200, 252, 112)}
      <path d="M122 110h156c34 0 52 30 58 66 6 34-14 58-36 50-16-6-24-30-44-30h-112c-20 0-28 24-44 30-22 8-42-16-36-50 6-36 24-66 58-66z" fill="#3b4a6b"/>
      <rect x="132" y="138" width="14" height="44" rx="4" fill="#fff"/>
      <rect x="117" y="153" width="44" height="14" rx="4" fill="#fff"/>
      <circle cx="262" cy="146" r="10" fill="#ff6b6b"/><circle cx="284" cy="166" r="10" fill="#ffcc33"/>
      <circle cx="240" cy="166" r="10" fill="#4fd18b"/><circle cx="262" cy="186" r="10" fill="#4f8cff"/>
      <rect x="182" y="146" width="16" height="7" rx="3" fill="#8b97b5"/><rect x="204" y="146" width="16" height="7" rx="3" fill="#8b97b5"/>
      <g fill="#ffd93d"><path d="M96 66l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z"/><path d="M308 58l4 9 10 1-8 6 3 10-9-5-9 5 3-10-8-6 10-1z"/></g>`),

    // 만화 캐릭터: 말풍선 + 만화 칸
    'anime-chars': make('#fff1d6', '#ffc98f', `
      ${shadow(200, 256, 112)}
      <rect x="92" y="88" width="216" height="150" rx="8" fill="#fff" stroke="#2d3142" stroke-width="5"/>
      <line x1="200" y1="88" x2="200" y2="238" stroke="#2d3142" stroke-width="5"/>
      <line x1="92" y1="166" x2="200" y2="166" stroke="#2d3142" stroke-width="5"/>
      <g stroke="#ffb020" stroke-width="3" opacity=".7"><line x1="212" y1="104" x2="296" y2="104"/><line x1="212" y1="124" x2="296" y2="124"/><line x1="212" y1="144" x2="296" y2="144"/></g>
      <circle cx="146" cy="128" r="18" fill="#ffd1a6"/><circle cx="140" cy="125" r="3" fill="#2d3142"/><circle cx="152" cy="125" r="3" fill="#2d3142"/>
      <path d="M140 134q6 6 12 0" fill="none" stroke="#2d3142" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M220 40h96a16 16 0 0 1 16 16v30a16 16 0 0 1-16 16h-56l-22 18 4-18h-22a16 16 0 0 1-16-16v-30a16 16 0 0 1 16-16z" fill="#fff" stroke="#2d3142" stroke-width="4"/>
      <text x="268" y="82" font-family="${KO}" font-size="28" font-weight="800" fill="#e84393" text-anchor="middle">?!</text>`),

    // 뽑기 게임: 돌림판
    'game-wheel': make('#fff1d6', '#ffcf8f', `
      ${shadow(200, 262, 92)}
      ${Array.from({ length: 8 }, (_, i) => {
        const a0 = (i / 8) * Math.PI * 2, a1 = ((i + 1) / 8) * Math.PI * 2, r = 96;
        const c = ['#ff6b6b', '#ffb020', '#ffd93d', '#4fd18b', '#4f8cff', '#7c5cff', '#e84393', '#00cec9'][i];
        return `<path d="M200 150L${(200 + r * Math.cos(a0)).toFixed(1)} ${(150 + r * Math.sin(a0)).toFixed(1)}A${r} ${r} 0 0 1 ${(200 + r * Math.cos(a1)).toFixed(1)} ${(150 + r * Math.sin(a1)).toFixed(1)}z" fill="${c}" stroke="#fff" stroke-width="3"/>`;
      }).join('')}
      <circle cx="200" cy="150" r="18" fill="#fff" stroke="#2d3142" stroke-width="5"/>
      <path d="M200 70l-14-26h28z" fill="#2d3142"/>`),

    // 뽑기 게임: 사다리
    'game-ladder': make('#e3f7ec', '#a8e6c5', `
      ${shadow(200, 262, 100)}
      <g stroke="#2d3142" stroke-width="6" stroke-linecap="round">
        ${[110, 170, 230, 290].map((x) => `<line x1="${x}" y1="70" x2="${x}" y2="230"/>`).join('')}
        <line x1="110" y1="100" x2="170" y2="100"/><line x1="230" y1="120" x2="290" y2="120"/>
        <line x1="170" y1="150" x2="230" y2="150"/><line x1="110" y1="190" x2="170" y2="190"/><line x1="230" y1="200" x2="290" y2="200"/>
      </g>
      <polyline points="170,70 170,100 110,100 110,190 170,190 170,230" fill="none" stroke="#ff4f5e" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      ${[110, 170, 230, 290].map((x, i) => `<circle cx="${x}" cy="56" r="13" fill="${['#ffb020', '#ff4f5e', '#4f8cff', '#7c5cff'][i]}"/>`).join('')}
      <rect x="152" y="236" width="36" height="22" rx="6" fill="#ffcc33"/><text x="170" y="252" font-family="${KO}" font-size="13" font-weight="800" fill="#7a4b00" text-anchor="middle">당첨</text>`),

    // 뽑기 게임: 구슬 추첨
    'game-marble': make('#e6e9ff', '#b3bcff', `
      ${shadow(200, 262, 100)}
      <rect x="110" y="40" width="180" height="216" rx="14" fill="#fff" opacity=".7"/>
      ${[[140, 90], [180, 90], [220, 90], [260, 90], [160, 130], [200, 130], [240, 130], [140, 170], [180, 170], [220, 170], [260, 170]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#8f8aa3"/>`).join('')}
      <line x1="150" y1="212" x2="196" y2="236" stroke="#5f5b70" stroke-width="5" stroke-linecap="round"/>
      <line x1="250" y1="212" x2="204" y2="236" stroke="#5f5b70" stroke-width="5" stroke-linecap="round"/>
      <circle cx="168" cy="66" r="11" fill="#ff6b6b"/><circle cx="214" cy="110" r="11" fill="#4f8cff"/>
      <circle cx="196" cy="152" r="11" fill="#ffb020"/><circle cx="238" cy="196" r="11" fill="#4fd18b"/>`),

    // 뽑기 게임: 경주마
    'game-horse': make('#e8f5d6', '#b8e29a', `
      ${shadow(200, 262, 120)}
      <rect x="70" y="70" width="260" height="170" rx="14" fill="#c98a4b"/>
      ${[0, 1, 2, 3].map((i) => `<line x1="70" y1="${112 + i * 42}" x2="330" y2="${112 + i * 42}" stroke="#fff" stroke-width="3" stroke-dasharray="10 8" opacity=".7"/>`).join('')}
      ${[0, 1, 2, 3].map((r) => [0, 1].map((c) => `<rect x="${300 + c * 12}" y="${70 + r * 42 + (c % 2 ? 21 : 0)}" width="12" height="21" fill="#2d3142"/>`).join('')).join('')}
      ${[[230, '#ff6b6b', 1], [270, '#4f8cff', 2], [180, '#ffcc33', 3], [205, '#7c5cff', 4]].map(([x, col, n], i) => `<circle cx="${x}" cy="${91 + i * 42}" r="15" fill="${col}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${97 + i * 42}" font-family="${NUM}" font-size="16" font-weight="700" fill="#fff" text-anchor="middle">${n}</text>`).join('')}`),

    // 뽑기 게임: 제비뽑기 상자
    'game-lots': make('#fff6cf', '#ffd68f', `
      ${shadow(200, 254, 100)}
      <g transform="rotate(-14 160 110)"><rect x="140" y="64" width="40" height="108" rx="6" fill="#fff" stroke="#e8d7a8" stroke-width="2"/></g>
      <g transform="rotate(9 236 112)"><rect x="216" y="68" width="40" height="108" rx="6" fill="#fff" stroke="#e8d7a8" stroke-width="2"/></g>
      <rect x="180" y="56" width="40" height="108" rx="6" fill="#fff" stroke="#e8d7a8" stroke-width="2"/>
      <path d="M114 146h172l-14 102h-144z" fill="#ff8a7a"/>
      <rect x="104" y="132" width="192" height="24" rx="8" fill="#ff6b6b"/>
      <text x="200" y="214" font-family="${KO}" font-size="30" font-weight="800" fill="#fff" text-anchor="middle">뽑기</text>
      <g transform="rotate(16 272 92)"><rect x="232" y="70" width="80" height="44" rx="8" fill="#ffd93d" stroke="#e0a800" stroke-width="2"/>
      <text x="272" y="100" font-family="${KO}" font-size="20" font-weight="800" fill="#7a4b00" text-anchor="middle">당첨</text></g>`),

    // 뽑기 게임: 폭탄 돌리기
    'game-bomb': make('#ffe3df', '#ffb4a2', `
      ${shadow(190, 258, 90)}
      <path d="M244 92q18-32 46-26" fill="none" stroke="#8a6a3f" stroke-width="7" stroke-linecap="round"/>
      <path d="M292 38l6 14 15 2-11 10 3 15-13-8-13 8 3-15-11-10 15-2z" fill="#ffd93d"/>
      <circle cx="292" cy="58" r="6" fill="#fff"/>
      <g stroke="#ff6b6b" stroke-width="5" stroke-linecap="round"><line x1="268" y1="34" x2="260" y2="22"/><line x1="314" y1="40" x2="326" y2="30"/><line x1="318" y1="70" x2="330" y2="76"/></g>
      <rect x="214" y="84" width="40" height="28" rx="6" fill="#5f5b70" transform="rotate(40 234 98)"/>
      <circle cx="184" cy="170" r="80" fill="#2d3142"/>
      <ellipse cx="152" cy="136" rx="22" ry="13" fill="#fff" opacity=".25" transform="rotate(-35 152 136)"/>`),

    // 뽑기 게임: 팀 나누기
    'game-teams': make('#e0f2ff', '#ffd6e0', `
      ${shadow(200, 252, 120)}
      <rect x="82" y="80" width="108" height="160" rx="18" fill="#fff" opacity=".65"/>
      <rect x="210" y="80" width="108" height="160" rx="18" fill="#fff" opacity=".65"/>
      ${[[114, 112, '#ff8a7a'], [158, 112, '#ff8a7a'], [136, 162, '#ff6b6b'], [242, 112, '#6fc8ff'], [286, 112, '#6fc8ff'], [264, 162, '#4f8cff']]
        .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="14" fill="${c}"/><path d="M${x - 22} ${y + 52}c0-24 9-32 22-32s22 8 22 32z" fill="${c}"/>`)
        .join('')}
      <circle cx="200" cy="160" r="24" fill="#2d3142"/>
      <text x="200" y="168" font-family="${NUM}" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">VS</text>`),

    // 뽑기 게임: 롤 내전 팀 짜기 (블루 방패 vs 레드 방패 + 라인 막대)
    'game-lol': make('#dbe6ff', '#ffd3d3', `
      ${shadow(200, 254, 120)}
      ${[['#3d7bff', '#2a5bd7', 136], ['#ff5a5a', '#d63c3c', 264]].map(([c, d, x]) => `
        <path d="M${x} 66l52 18v52c0 40-26 66-52 80-26-14-52-40-52-80v-52z" fill="${c}" stroke="${d}" stroke-width="5"/>
        ${[0, 1, 2, 3, 4].map((k) => `<rect x="${x - 26}" y="${100 + k * 18}" width="52" height="9" rx="4.5" fill="#fff" opacity="${0.95 - k * 0.12}"/>`).join('')}`).join('')}
      <circle cx="200" cy="150" r="24" fill="#2d3142"/>
      <text x="200" y="158" font-family="${NUM}" font-size="20" font-weight="700" fill="#fff" text-anchor="middle">VS</text>`),

    // 라이어 게임: 가면 쓴 사람들 + 물음표
    'game-liar': make('#efe7ff', '#ffd6e0', `
      ${shadow(200, 254, 120)}
      ${[[120, '#6fc8ff'], [200, '#ff8a7a'], [280, '#7ad98f']].map(([x, c], i) => `<circle cx="${x}" cy="${i === 1 ? 118 : 132}" r="${i === 1 ? 36 : 30}" fill="${c}"/><path d="M${x - (i === 1 ? 52 : 44)} ${i === 1 ? 236 : 236}c0-${i === 1 ? 60 : 48} ${i === 1 ? 24 : 20}-${i === 1 ? 76 : 64} ${i === 1 ? 52 : 44}-${i === 1 ? 76 : 64}s${i === 1 ? 52 : 44} ${i === 1 ? 16 : 16} ${i === 1 ? 52 : 44} ${i === 1 ? 76 : 64}z" fill="${c}"/>`).join('')}
      <rect x="168" y="104" width="64" height="20" rx="10" fill="#2d3142"/><circle cx="186" cy="114" r="5" fill="#fff"/><circle cx="214" cy="114" r="5" fill="#fff"/>
      <circle cx="292" cy="70" r="24" fill="#2d3142"/><text x="292" y="81" font-family="${NUM}" font-size="30" font-weight="700" fill="#ffd93d" text-anchor="middle">?</text>`),

    // 10초 미니게임: 스톱워치 + 번개
    'game-mini': make('#e0f2ff', '#c8b4ff', `
      ${shadow(200, 256, 100)}
      <circle cx="200" cy="160" r="82" fill="#fff" stroke="#2d3142" stroke-width="10"/>
      <rect x="186" y="56" width="28" height="20" rx="5" fill="#2d3142"/><rect x="176" y="46" width="48" height="12" rx="6" fill="#ff5a5a"/>
      <line x1="200" y1="160" x2="200" y2="104" stroke="#7c5cff" stroke-width="9" stroke-linecap="round"/>
      <line x1="200" y1="160" x2="240" y2="180" stroke="#2d3142" stroke-width="7" stroke-linecap="round"/>
      <circle cx="200" cy="160" r="9" fill="#2d3142"/>
      <text x="200" y="222" font-family="${NUM}" font-size="26" font-weight="700" fill="#7c5cff" text-anchor="middle">10.00</text>
      <path d="M306 70l-20 34h14l-10 28 28-38h-14l12-24z" fill="#ffd93d" stroke="#e8a900" stroke-width="3"/>`),

    // 악어 룰렛: 입 벌린 악어 + 이빨
    'game-croc': make('#e3f7ec', '#fff1c4', `
      ${shadow(200, 258, 130)}
      <path d="M70 150 Q80 70 180 66 L300 74 Q340 80 340 120 L340 150 Z" fill="#4fbf6a"/>
      <circle cx="170" cy="92" r="14" fill="#fff"/><circle cx="174" cy="92" r="7" fill="#1d1b26"/>
      <circle cx="230" cy="92" r="14" fill="#fff"/><circle cx="234" cy="92" r="7" fill="#1d1b26"/>
      <path d="M70 150 L340 150" stroke="#2e8a44" stroke-width="5"/>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M${90 + i * 31} 152 l14 24 l14 -24 z" fill="${i === 5 ? '#ff5a5a' : '#fff'}" stroke="#cfd5e2" stroke-width="2"/>`).join('')}
      <path d="M70 178 L340 178 L340 196 Q330 236 200 238 Q80 236 70 196 Z" fill="#4fbf6a"/>
      <path d="M78 182 L332 182 L332 192 Q200 206 78 192 Z" fill="#e86f7f"/>`),

    // 뽑기 게임: 주사위·동전
    'game-dice': make('#d9fbea', '#9eefcf', `
      ${shadow(200, 256, 110)}
      <g transform="rotate(-12 150 168)">
        <rect x="104" y="122" width="92" height="92" rx="18" fill="#fff" stroke="#cfd8d3" stroke-width="3"/>
        ${[[128, 146], [172, 146], [150, 168], [128, 190], [172, 190]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#2d3142"/>`).join('')}
      </g>
      <g transform="rotate(12 250 132)">
        <rect x="210" y="92" width="80" height="80" rx="16" fill="#fff" stroke="#cfd8d3" stroke-width="3"/>
        ${[[230, 112], [250, 132], [270, 152]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="#2d3142"/>`).join('')}
      </g>
      <circle cx="268" cy="214" r="30" fill="#f2b51d" stroke="#c98a0b" stroke-width="4"/>
      <text x="268" y="224" font-family="${KO}" font-size="26" font-weight="800" fill="#7a4b00" text-anchor="middle">앞</text>`),

    // 롤 챔피언: 방패 + 엇갈린 칼 + 물음표 (게임 로고는 쓰지 않음)
    'lol-champs': make('#e3e9ff', '#b9c6f2', `
      ${shadow(200, 256, 100)}
      <g stroke="#8b97b5" stroke-width="10" stroke-linecap="round"><line x1="110" y1="70" x2="290" y2="236"/><line x1="290" y1="70" x2="110" y2="236"/></g>
      <g stroke="#c9a227" stroke-width="12" stroke-linecap="round"><line x1="120" y1="226" x2="140" y2="206"/><line x1="280" y1="226" x2="260" y2="206"/></g>
      <path d="M200 60l78 26v64c0 52-36 84-78 102-42-18-78-50-78-102V86z" fill="#1f3a6e" stroke="#c9a227" stroke-width="7"/>
      <path d="M200 84l56 19v47c0 38-26 62-56 76-30-14-56-38-56-76v-47z" fill="#2b5aa8"/>
      <text x="200" y="186" font-family="${NUM}" font-size="78" font-weight="700" fill="#f3d36b" text-anchor="middle">?</text>`),

    // 멜로디: 오선 위 음표 + 스피커
    melody: make('#ffe6f7', '#d9b8ff', `
      ${shadow(200, 256, 110)}
      <rect x="84" y="70" width="232" height="150" rx="18" fill="#fff" opacity=".85"/>
      ${[0, 1, 2, 3, 4].map((i) => `<line x1="100" y1="${104 + i * 18}" x2="300" y2="${104 + i * 18}" stroke="#c9b8e8" stroke-width="2.5"/>`).join('')}
      ${[[132, 176], [178, 158], [224, 140], [270, 122]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="10" transform="rotate(-20 ${x} ${y})" fill="#7c5cff"/><line x1="${x + 11}" y1="${y - 3}" x2="${x + 11}" y2="${y - 58}" stroke="#7c5cff" stroke-width="4"/>`).join('')}
      <path d="M233 82l48-18v10l-48 18z" fill="#7c5cff"/>
      <path d="M90 236h14l18 14v-40l-18 14h-14z" fill="#2d3142"/>
      <path d="M132 220q8 10 0 20M142 214q14 16 0 32" fill="none" stroke="#2d3142" stroke-width="4" stroke-linecap="round"/>`),

    // 노래 제목: 마이크 + 음표
    songs: make('#ffe2f1', '#c9b6ff', `
      ${shadow(200, 256, 90)}
      <rect x="168" y="60" width="64" height="104" rx="32" fill="#2d3142"/>
      <g stroke="#5f5b70" stroke-width="3">${[80, 96, 112, 128, 144].map((y) => `<line x1="174" y1="${y}" x2="226" y2="${y}"/>`).join('')}</g>
      <path d="M148 132v12c0 30 24 52 52 52s52-22 52-52v-12" fill="none" stroke="#2d3142" stroke-width="8" stroke-linecap="round"/>
      <line x1="200" y1="196" x2="200" y2="236" stroke="#2d3142" stroke-width="8"/><rect x="164" y="232" width="72" height="12" rx="6" fill="#2d3142"/>
      <g fill="#ff5fa2"><ellipse cx="112" cy="128" rx="13" ry="10"/><rect x="121" y="78" width="5" height="52"/><path d="M121 78q18 6 22 26q-10-12-22-12z"/></g>
      <g fill="#7c5cff"><ellipse cx="284" cy="112" rx="12" ry="9"/><ellipse cx="316" cy="104" rx="12" ry="9"/><rect x="292" y="62" width="5" height="50"/><rect x="324" y="54" width="5" height="50"/><path d="M292 62l37-8v10l-37 8z"/></g>`),

    // 색 조합: 색 띠 + 물음표
    'char-colors': make('#fff1d6', '#ffc6d9', `
      ${shadow(200, 256, 120)}
      <g transform="rotate(-6 200 150)">
        <rect x="86" y="80" width="228" height="140" rx="20" fill="#fff"/>
        ${['#f6d21b', '#e3350d', '#2b2b2b', '#4f8cff', '#4fd18b'].map((c, i) => `<rect x="${98 + i * 41}" y="92" width="41" height="116" fill="${c}"/>`).join('')}
      </g>
      <circle cx="304" cy="84" r="30" fill="#2d3142"/>
      <text x="304" y="98" font-family="${NUM}" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">?</text>`),

    // 줄거리: 대본(책) + 필름
    plots: make('#e3e6ff', '#ffd1e3', `
      ${shadow(200, 256, 110)}
      <g transform="rotate(-8 150 150)"><rect x="96" y="70" width="120" height="160" rx="10" fill="#fff" stroke="#c9c3e6" stroke-width="3"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="114" y="${98 + i * 20}" width="${[84, 70, 84, 60, 80, 50][i]}" height="7" rx="3.5" fill="#d9d4ef"/>`).join('')}</g>
      <g transform="rotate(10 258 150)"><rect x="214" y="78" width="88" height="150" rx="8" fill="#2d3142"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="220" y="${88 + i * 23}" width="10" height="12" rx="2" fill="#fff"/><rect x="286" y="${88 + i * 23}" width="10" height="12" rx="2" fill="#fff"/>`).join('')}
        <rect x="238" y="92" width="40" height="56" rx="4" fill="#ffb0d6"/><rect x="238" y="156" width="40" height="56" rx="4" fill="#aab3ff"/></g>`),

    // 관람등급: 동그란 등급 표시 4개
    'movie-ratings': make('#e8ebf3', '#c2cde2', `
      ${shadow(200, 252, 130)}
      ${[['ALL', '#2bb24c'], ['12', '#f2b51d'], ['15', '#f07d1a'], ['19', '#e0312b']].map(([t, c], i) => `
        <circle cx="${110 + (i % 2) * 180}" cy="${100 + Math.floor(i / 2) * 104}" r="44" fill="${c}" stroke="#fff" stroke-width="6"/>
        <text x="${110 + (i % 2) * 180}" y="${100 + Math.floor(i / 2) * 104 + (t === 'ALL' ? 11 : 15)}" font-family="${NUM}" font-size="${t === 'ALL' ? 30 : 42}" font-weight="700" fill="#fff" text-anchor="middle">${t}</text>`).join('')}
      <circle cx="200" cy="152" r="26" fill="#2d3142"/>
      <text x="200" y="166" font-family="${NUM}" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">?</text>`),

    // 사투리: 말풍선 두 개
    dialect: make('#efe7ff', '#c8b4ff', `
      ${shadow(200, 256, 120)}
      <path d="M84 72h132a18 18 0 0 1 18 18v52a18 18 0 0 1-18 18h-96l-26 22 6-22h-16a18 18 0 0 1-18-18v-52a18 18 0 0 1 18-18z" fill="#fff"/>
      <text x="150" y="126" font-family="${KO}" font-size="28" font-weight="800" fill="#7c5cff" text-anchor="middle">머라카노</text>
      <path d="M184 150h132a18 18 0 0 1 18 18v52a18 18 0 0 1-18 18h-16l6 22-26-22h-96a18 18 0 0 1-18-18v-52a18 18 0 0 1 18-18z" fill="#2d3142"/>
      <text x="250" y="204" font-family="${KO}" font-size="28" font-weight="800" fill="#ffd166" text-anchor="middle">했당께</text>`),

    // 밈: 웃는 얼굴 + ㅋㅋㅋ
    memes: make('#fff6cf', '#ffd68f', `
      ${shadow(176, 256, 90)}
      <circle cx="176" cy="160" r="82" fill="#ffd93d" stroke="#e8a900" stroke-width="5"/>
      <path d="M134 140q12-16 24 0M194 140q12-16 24 0" fill="none" stroke="#2d3142" stroke-width="7" stroke-linecap="round"/>
      <path d="M128 170q48 56 96 0z" fill="#2d3142"/><path d="M146 194q30 20 60 0q-30 8-60 0z" fill="#ff6b6b"/>
      <path d="M112 128q-10 18 2 30" fill="none" stroke="#4fb6ff" stroke-width="6" stroke-linecap="round"/>
      <rect x="236" y="56" width="92" height="48" rx="16" fill="#fff"/><path d="M252 104l-6 16 22-16z" fill="#fff"/>
      <text x="282" y="90" font-family="${KO}" font-size="26" font-weight="800" fill="#ff6b6b" text-anchor="middle">ㅋㅋㅋ</text>`),

    // 랭킹: 시상대 + 주제 그림
    'rank-world': make('#dfe9ff', '#ffe3a3', `
      ${shadow(200, 256, 120)}
      <rect x="92" y="170" width="72" height="80" rx="8" fill="#cfd5e2"/><text x="128" y="222" font-family="${NUM}" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">2</text>
      <rect x="164" y="132" width="72" height="118" rx="8" fill="#ffc83d"/><text x="200" y="200" font-family="${NUM}" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">?</text>
      <rect x="236" y="192" width="72" height="58" rx="8" fill="#e0a26a"/><text x="272" y="232" font-family="${NUM}" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">3</text>
      <path d="M150 120l34-58 22 34 12-18 32 42z" fill="#6b7fa8"/><path d="M184 62l11 19-7-3-6 6-6-5-5 2z" fill="#fff"/><path d="M218 78l7 11-5-1-3 4-4-3-3 1z" fill="#fff"/><path d="M196 48v-16l14 5-14 5" fill="#ff5a5a" stroke="#2d3142" stroke-width="2"/>`),

    // 랭킹: 시상대 + 주제 그림
    'rank-sales': make('#fff1d6', '#ffc46b', `
      ${shadow(200, 256, 120)}
      <rect x="92" y="170" width="72" height="80" rx="8" fill="#cfd5e2"/><text x="128" y="222" font-family="${NUM}" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">2</text>
      <rect x="164" y="132" width="72" height="118" rx="8" fill="#ffc83d"/><text x="200" y="200" font-family="${NUM}" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">?</text>
      <rect x="236" y="192" width="72" height="58" rx="8" fill="#e0a26a"/><text x="272" y="232" font-family="${NUM}" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">3</text>
      <rect x="176" y="62" width="48" height="52" rx="6" fill="#ff6b6b"/><path d="M186 62v-8a14 14 0 0 1 28 0v8" fill="none" stroke="#c0392b" stroke-width="5"/><text x="200" y="98" font-family="${NUM}" font-size="22" font-weight="700" fill="#fff" text-anchor="middle">$</text>`),

    // 랭킹: 시상대 + 주제 그림
    'rank-speed': make('#e0f7ff', '#ffd6a3', `
      ${shadow(200, 256, 120)}
      <rect x="92" y="170" width="72" height="80" rx="8" fill="#cfd5e2"/><text x="128" y="222" font-family="${NUM}" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">2</text>
      <rect x="164" y="132" width="72" height="118" rx="8" fill="#ffc83d"/><text x="200" y="200" font-family="${NUM}" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">?</text>
      <rect x="236" y="192" width="72" height="58" rx="8" fill="#e0a26a"/><text x="272" y="232" font-family="${NUM}" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">3</text>
      <g stroke="#4f8cff" stroke-width="6" stroke-linecap="round"><line x1="140" y1="74" x2="176" y2="74"/><line x1="130" y1="92" x2="172" y2="92"/><line x1="146" y1="110" x2="176" y2="110"/></g><path d="M214 56l-26 40h20l-12 32 34-46h-20l14-26z" fill="#ffd93d" stroke="#e8a900" stroke-width="3"/>`),

    // 랭킹: 시상대 + 주제 그림
    'rank-sports': make('#e3f7ec', '#ffd36b', `
      ${shadow(200, 256, 120)}
      <rect x="92" y="170" width="72" height="80" rx="8" fill="#cfd5e2"/><text x="128" y="222" font-family="${NUM}" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">2</text>
      <rect x="164" y="132" width="72" height="118" rx="8" fill="#ffc83d"/><text x="200" y="200" font-family="${NUM}" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">?</text>
      <rect x="236" y="192" width="72" height="58" rx="8" fill="#e0a26a"/><text x="272" y="232" font-family="${NUM}" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">3</text>
      <path d="M176 58h48v18a24 24 0 0 1-48 0z" fill="#ffd93d" stroke="#e8a900" stroke-width="3"/><path d="M176 64h-12a12 12 0 0 0 14 18M224 64h12a12 12 0 0 1-14 18" fill="none" stroke="#e8a900" stroke-width="4"/><rect x="194" y="98" width="12" height="12" fill="#e8a900"/><rect x="184" y="110" width="32" height="8" rx="3" fill="#c98a0b"/>`),

    // 랭킹: 시상대 + 주제 그림
    'rank-web': make('#efe7ff', '#ffd2a6', `
      ${shadow(200, 256, 120)}
      <rect x="92" y="170" width="72" height="80" rx="8" fill="#cfd5e2"/><text x="128" y="222" font-family="${NUM}" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">2</text>
      <rect x="164" y="132" width="72" height="118" rx="8" fill="#ffc83d"/><text x="200" y="200" font-family="${NUM}" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">?</text>
      <rect x="236" y="192" width="72" height="58" rx="8" fill="#e0a26a"/><text x="272" y="232" font-family="${NUM}" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">3</text>
      <rect x="160" y="54" width="80" height="58" rx="8" fill="#fff" stroke="#7c5cff" stroke-width="4"/><circle cx="172" cy="64" r="3" fill="#ff6b6b"/><circle cx="182" cy="64" r="3" fill="#ffd93d"/><circle cx="192" cy="64" r="3" fill="#4fd18b"/><path d="M192 80l20 12-20 12z" fill="#ff4f5e"/>`),

    // 쉬운 상식: 웃는 별 + '쉬움' 리본
    'trivia-easy': make('#fff6cf', '#c8f0d8', `
      ${shadow(200, 254, 100)}
      <path d="M200 52l28 58 64 8-47 44 12 63-57-31-57 31 12-63-47-44 64-8z" fill="#ffd93d" stroke="#e8a900" stroke-width="5" stroke-linejoin="round"/>
      <circle cx="182" cy="140" r="7" fill="#5a3300"/><circle cx="218" cy="140" r="7" fill="#5a3300"/>
      <path d="M178 160q22 22 44 0" fill="none" stroke="#5a3300" stroke-width="6" stroke-linecap="round"/>
      <circle cx="166" cy="158" r="8" fill="#ff9b8a" opacity=".7"/><circle cx="234" cy="158" r="8" fill="#ff9b8a" opacity=".7"/>
      <rect x="140" y="222" width="120" height="34" rx="17" fill="#4fd18b"/>
      <text x="200" y="246" font-family="${KO}" font-size="20" font-weight="800" fill="#fff" text-anchor="middle">쉬움</text>`),

    // 일반 상식: 펼친 책 + 전구
    trivia: make('#e3f0ff', '#b8d4ff', `
      ${shadow(200, 254, 120)}
      <path d="M200 110c-30-18-70-22-110-14v128c40-8 80-4 110 14z" fill="#fff" stroke="#c9d6ef" stroke-width="3"/>
      <path d="M200 110c30-18 70-22 110-14v128c-40-8-80-4-110 14z" fill="#fff" stroke="#c9d6ef" stroke-width="3"/>
      <line x1="200" y1="110" x2="200" y2="238" stroke="#c9d6ef" stroke-width="3"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${108}" y="${130 + i * 20}" width="${[70, 60, 74, 50][i]}" height="6" rx="3" fill="#d9e3f5"/><rect x="${222}" y="${130 + i * 20}" width="${[66, 74, 52, 70][i]}" height="6" rx="3" fill="#d9e3f5"/>`).join('')}
      <circle cx="200" cy="72" r="30" fill="#ffd93d" stroke="#e8a900" stroke-width="4"/>
      <rect x="188" y="100" width="24" height="12" rx="3" fill="#8f8aa3"/>
      <text x="200" y="84" font-family="${NUM}" font-size="34" font-weight="700" fill="#7a4b00" text-anchor="middle">?</text>`),

    // 생활·과학 상식: 플라스크 + 집
    'life-trivia': make('#e3f7ec', '#b8e6ff', `
      ${shadow(200, 254, 120)}
      <path d="M118 150l52-44 52 44v84h-104z" fill="#fff" stroke="#9fc9b3" stroke-width="4"/>
      <path d="M106 156l64-56 64 56" fill="none" stroke="#ff8a7a" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="156" y="190" width="28" height="44" rx="4" fill="#ffd166"/>
      <path d="M262 92v40l-30 70a14 14 0 0 0 13 20h66a14 14 0 0 0 13-20l-30-70v-40z" fill="#fff" stroke="#6b7fa8" stroke-width="5" stroke-linejoin="round"/>
      <path d="M246 170h64l14 32a8 8 0 0 1-7 12h-78a8 8 0 0 1-7-12z" fill="#4fd18b"/>
      <rect x="254" y="84" width="48" height="10" rx="5" fill="#6b7fa8"/>
      <circle cx="270" cy="190" r="5" fill="#fff" opacity=".8"/><circle cx="288" cy="200" r="4" fill="#fff" opacity=".8"/>`),

    // 캐치마인드: 스케치북 + 연필 + 그려지는 집
    catchmind: make('#fff6cf', '#c8f0d8', `
      ${shadow(200, 256, 120)}
      <rect x="92" y="64" width="216" height="176" rx="12" fill="#fffef8" stroke="#2d3142" stroke-width="5"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${112 + i * 35}" cy="64" r="6" fill="#fff" stroke="#2d3142" stroke-width="4"/>`).join('')}
      <path d="M140 200 V150 L190 112 L240 150 V200 Z" fill="none" stroke="#2d3142" stroke-width="5" stroke-linejoin="round"/>
      <path d="M180 200 V172 H200 V200" fill="none" stroke="#2d3142" stroke-width="5"/>
      <path d="M150 104 q12 -14 24 0 t24 0" fill="none" stroke="#4f8cff" stroke-width="4" stroke-linecap="round"/>
      <g transform="rotate(35 280 150)"><rect x="268" y="96" width="24" height="98" rx="4" fill="#ffd166" stroke="#2d3142" stroke-width="4"/><path d="M268 194 l12 24 l12 -24 z" fill="#f5d2a8" stroke="#2d3142" stroke-width="4" stroke-linejoin="round"/><rect x="268" y="96" width="24" height="16" fill="#ff8a7a" stroke="#2d3142" stroke-width="4"/></g>`),

    // MBTI: 알파벳 네 칸 + 물음표
    mbti: make('#ffe9f3', '#c9b6ff', `
      ${shadow(200, 248, 130)}
      ${[['E', '#ff8a7a'], ['N', '#ffd166'], ['F', '#7ad98f'], ['P', '#6fc8ff']].map(([l, c], i) => `
        <g transform="rotate(${[-8, 4, -3, 7][i]} ${92 + i * 72} 150)">
          <rect x="${62 + i * 72}" y="${110 + (i % 2) * 12}" width="60" height="70" rx="14" fill="${c}"/>
          <rect x="${62 + i * 72}" y="${110 + (i % 2) * 12}" width="60" height="70" rx="14" fill="none" stroke="#fff" stroke-width="4"/>
          <text x="${92 + i * 72}" y="${160 + (i % 2) * 12}" font-family="${NUM}" font-size="40" font-weight="700" fill="#fff" text-anchor="middle">${l}</text>
        </g>`).join('')}
      <circle cx="320" cy="84" r="22" fill="#2d3142"/>
      <text x="320" y="96" font-family="${NUM}" font-size="30" font-weight="700" fill="#fff" text-anchor="middle">?</text>`),

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
