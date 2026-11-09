// 운세 탭: 띠별 오늘의 운세 · 별자리 운세 · 사주팔자 · 타로
// 주소: /fortune/ (모아 보기), /fortune/<띠·별자리 id>/, /saju/, /tarot/
// 재미로 보는 운세. 띠·별자리 운세는 날짜로 정해지는 값이라 같은 날엔 누구에게나 같고, 사주는 입력한 생년월일시로 계산.
// 입력한 생년월일은 이 기기(localStorage)에만 저장하고 어디로도 보내지 않음.
'use strict';

/* ───────── 기본 자료 ───────── */

const STEMS = [
  ['갑', '甲', '목', '+'], ['을', '乙', '목', '-'], ['병', '丙', '화', '+'], ['정', '丁', '화', '-'], ['무', '戊', '토', '+'],
  ['기', '己', '토', '-'], ['경', '庚', '금', '+'], ['신', '辛', '금', '-'], ['임', '壬', '수', '+'], ['계', '癸', '수', '-'],
];
const BRANCHES = [
  ['자', '子', '수'], ['축', '丑', '토'], ['인', '寅', '목'], ['묘', '卯', '목'], ['진', '辰', '토'], ['사', '巳', '화'],
  ['오', '午', '화'], ['미', '未', '토'], ['신', '申', '금'], ['유', '酉', '금'], ['술', '戌', '토'], ['해', '亥', '수'],
];
const ELEMENTS = ['목', '화', '토', '금', '수'];
const ELEMENT_INFO = {
  목: { hanja: '木', color: '#3fae5a', name: '나무', lucky: '초록색', food: '푸른 채소·나물', tip: '산책하며 나무와 풀을 보는 시간' },
  화: { hanja: '火', color: '#e5484d', name: '불', lucky: '빨간색', food: '따뜻한 음식·쓴맛 차', tip: '햇볕을 쬐고 몸을 따뜻하게' },
  토: { hanja: '土', color: '#c9932d', name: '흙', lucky: '노란색·베이지', food: '고구마·호박 같은 단맛 곡물', tip: '규칙적인 식사와 정리 정돈' },
  금: { hanja: '金', color: '#8a94a6', name: '쇠', lucky: '흰색·은색', food: '무·배·도라지 같은 흰 음식', tip: '깊은 호흡과 물건 정리' },
  수: { hanja: '水', color: '#3b6fd8', name: '물', lucky: '검정·남색', food: '검은콩·해조류', tip: '물을 자주 마시고 충분히 자기' },
};
// 상생: 목→화→토→금→수→목 / 상극: 목→토→수→화→금→목
const GEN = { 목: '화', 화: '토', 토: '금', 금: '수', 수: '목' };
const CTRL = { 목: '토', 토: '수', 수: '화', 화: '금', 금: '목' };

const ANIMALS = [
  { id: 'rat', name: '쥐', emoji: '🐭', b: 0, trait: '눈치가 빠르고 부지런해 기회를 잘 잡는 띠예요. 알뜰하고 계획적이라 모아 두는 힘이 좋아요.' },
  { id: 'ox', name: '소', emoji: '🐮', b: 1, trait: '성실하고 끈기 있어 한 번 시작한 일은 끝을 보는 띠예요. 말보다 행동으로 믿음을 줘요.' },
  { id: 'tiger', name: '호랑이', emoji: '🐯', b: 2, trait: '용감하고 리더십이 강한 띠예요. 정의감이 있고 새로운 일에 먼저 뛰어드는 편이에요.' },
  { id: 'rabbit', name: '토끼', emoji: '🐰', b: 3, trait: '온화하고 감각이 섬세한 띠예요. 사람 사이를 부드럽게 만들고 분위기를 잘 읽어요.' },
  { id: 'dragon', name: '용', emoji: '🐲', b: 4, trait: '자신감과 추진력이 넘치는 띠예요. 꿈이 크고 주변에 활력을 주는 존재예요.' },
  { id: 'snake', name: '뱀', emoji: '🐍', b: 5, trait: '지혜롭고 침착한 띠예요. 깊이 생각하고 결정하며 직감이 잘 맞는 편이에요.' },
  { id: 'horse', name: '말', emoji: '🐴', b: 6, trait: '활발하고 자유로운 띠예요. 행동이 빠르고 사람들과 어울리기를 좋아해요.' },
  { id: 'sheep', name: '양', emoji: '🐑', b: 7, trait: '마음이 따뜻하고 예술 감각이 있는 띠예요. 배려심이 깊어 곁에 사람이 많아요.' },
  { id: 'monkey', name: '원숭이', emoji: '🐵', b: 8, trait: '재치 있고 손재주가 좋은 띠예요. 문제를 기발하게 푸는 능력이 뛰어나요.' },
  { id: 'rooster', name: '닭', emoji: '🐔', b: 9, trait: '꼼꼼하고 부지런한 띠예요. 자기 관리가 철저하고 맡은 일을 깔끔하게 해내요.' },
  { id: 'dog', name: '개', emoji: '🐶', b: 10, trait: '의리 있고 정직한 띠예요. 한번 믿은 사람은 끝까지 지키는 든든한 편이에요.' },
  { id: 'pig', name: '돼지', emoji: '🐷', b: 11, trait: '너그럽고 복이 많은 띠예요. 솔직하고 정이 많아 사람들이 편하게 다가와요.' },
];
// 별자리: 시작 월·일 (그날부터 다음 별자리 전날까지)
const SIGNS = [
  { id: 'aries', name: '양자리', emoji: '♈', from: [3, 21], to: [4, 19], el: '불', trait: '도전 정신이 강하고 솔직해요. 시작하는 힘이 누구보다 좋아요.' },
  { id: 'taurus', name: '황소자리', emoji: '♉', from: [4, 20], to: [5, 20], el: '흙', trait: '차분하고 끈기 있어요. 좋은 것을 알아보는 안목이 있어요.' },
  { id: 'gemini', name: '쌍둥이자리', emoji: '♊', from: [5, 21], to: [6, 21], el: '공기', trait: '호기심이 많고 말재주가 좋아요. 새로운 정보를 빨리 흡수해요.' },
  { id: 'cancer', name: '게자리', emoji: '♋', from: [6, 22], to: [7, 22], el: '물', trait: '정이 많고 가족·친구를 잘 챙겨요. 감수성이 풍부해요.' },
  { id: 'leo', name: '사자자리', emoji: '♌', from: [7, 23], to: [8, 22], el: '불', trait: '당당하고 따뜻한 리더예요. 어디서든 눈에 띄는 존재감이 있어요.' },
  { id: 'virgo', name: '처녀자리', emoji: '♍', from: [8, 23], to: [9, 22], el: '흙', trait: '꼼꼼하고 분석력이 뛰어나요. 남을 돕는 데서 보람을 느껴요.' },
  { id: 'libra', name: '천칭자리', emoji: '♎', from: [9, 23], to: [10, 22], el: '공기', trait: '균형 감각이 좋고 사교적이에요. 아름다운 것을 좋아해요.' },
  { id: 'scorpio', name: '전갈자리', emoji: '♏', from: [10, 23], to: [11, 22], el: '물', trait: '집중력이 강하고 속이 깊어요. 한번 정한 목표는 끝까지 가요.' },
  { id: 'sagittarius', name: '사수자리', emoji: '♐', from: [11, 23], to: [12, 24], el: '불', trait: '낙천적이고 자유로워요. 여행과 배움을 사랑해요.' },
  { id: 'capricorn', name: '염소자리', emoji: '♑', from: [12, 25], to: [1, 19], el: '흙', trait: '책임감이 강하고 현실적이에요. 차근차근 높이 올라가요.' },
  { id: 'aquarius', name: '물병자리', emoji: '♒', from: [1, 20], to: [2, 18], el: '공기', trait: '독창적이고 생각이 자유로워요. 남들과 다른 시선이 강점이에요.' },
  { id: 'pisces', name: '물고기자리', emoji: '♓', from: [2, 19], to: [3, 20], el: '물', trait: '상상력이 풍부하고 공감 능력이 뛰어나요. 예술 감각이 있어요.' },
];
const signRange = (s) => `${s.from[0]}월 ${s.from[1]}일 ~ ${s.to[0]}월 ${s.to[1]}일`;
const animalYears = (a) => {
  const ys = [];
  for (let y = 1936; y <= 2031; y++) if ((((y - 4) % 12) + 12) % 12 === a.b) ys.push(y);
  return ys;
};

/* ───────── 날짜·간지 계산 ───────── */

// 날짜만 쓰는 시각 (로컬 기준 연·월·일)
const todayYmd = () => {
  const d = new Date();
  return [d.getFullYear(), d.getMonth() + 1, d.getDate()];
};
const ymdKey = ([y, m, d]) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
// 60갑자 번호 (0 = 갑자). 2000-01-01 = 무오일로 맞춤
const dayIndex = ([y, m, d]) => {
  const jdn = Math.floor(Date.UTC(y, m - 1, d) / 86400000) + 2440588;
  return (((jdn + 49) % 60) + 60) % 60;
};
const ganji = (i) => ({ s: i % 10, b: i % 12 });
const ganjiName = ({ s, b }) => `${STEMS[s][0]}${BRANCHES[b][0]}`;
const ganjiHanja = ({ s, b }) => `${STEMS[s][1]}${BRANCHES[b][1]}`;

// 절기 시작일(대략, ±1일): [월, 일, 월지] — 소한부터
const TERMS = [[1, 6, 1], [2, 4, 2], [3, 6, 3], [4, 5, 4], [5, 6, 5], [6, 6, 6], [7, 7, 7], [8, 8, 8], [9, 8, 9], [10, 8, 10], [11, 7, 11], [12, 7, 0]];

function sajuPillars([y, m, d], hourBranch) {
  const before = (mm, dd) => m < mm || (m === mm && d < dd);
  const sy = before(2, 4) ? y - 1 : y; // 입춘 전이면 지난해
  const year = { s: (((sy - 4) % 10) + 10) % 10, b: (((sy - 4) % 12) + 12) % 12 };
  let mb = 0; // 소한 전(1월 1~5일)은 자월
  for (const [mm, dd, br] of TERMS) if (!before(mm, dd)) mb = br;
  const inStem = ((year.s % 5) * 2 + 2) % 10; // 인월의 천간
  const month = { s: (inStem + ((mb - 2 + 12) % 12)) % 10, b: mb };
  const day = ganji(dayIndex([y, m, d]));
  const hour = hourBranch == null ? null : { s: (((day.s % 5) * 2) + hourBranch) % 10, b: hourBranch };
  return { year, month, day, hour };
}

// 나(일간 오행)와 상대 오행의 관계 → 십성 묶음
function relation(me, other) {
  if (me === other) return '비겁';
  if (GEN[me] === other) return '식상';
  if (CTRL[me] === other) return '재성';
  if (CTRL[other] === me) return '관성';
  return '인성';
}

/* ───────── 날짜로 정해지는 난수 ───────── */

function seeded(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}
const pickOf = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/* ───────── 운세 문장 ───────── */

const CATS = [
  { id: 'total', label: '총운', icon: '🌈' },
  { id: 'money', label: '금전운', icon: '💰' },
  { id: 'love', label: '애정운', icon: '💕' },
  { id: 'work', label: '일·공부', icon: '📚' },
  { id: 'health', label: '건강운', icon: '🍀' },
];
// 단계: 0 조심, 1 보통, 2 좋음
const LINES = {
  total: [
    ['서두르면 꼬이기 쉬운 날이에요. 한 박자 쉬어 가면 실수를 막을 수 있어요.', '오늘은 무리한 약속보다 하던 일을 마무리하는 데 힘을 쓰세요.', '작은 오해가 생길 수 있어요. 말은 짧고 분명하게 하는 게 좋아요.', '기대보다 느리게 흘러가도 괜찮아요. 내일을 위한 준비 기간이에요.', '계획에 없던 일이 끼어들 수 있으니 시간 여유를 두세요.'],
    ['평소처럼 차분하게 보내면 무난한 하루예요.', '크게 좋지도 나쁘지도 않은 날, 작은 즐거움을 찾아보세요.', '하던 일을 꾸준히 하면 조금씩 결과가 보여요.', '주변 사람과 가벼운 대화가 기분을 바꿔 줄 거예요.', '익숙한 길보다 새로운 길로 가 보면 뜻밖의 발견이 있어요.'],
    ['기운이 좋아 무엇을 시작해도 술술 풀리는 날이에요.', '미뤄 둔 일을 처리하기 딱 좋은 날이에요. 생각보다 빨리 끝나요.', '반가운 소식이 들려올 수 있어요. 연락을 놓치지 마세요.', '자신감 있게 나서면 좋은 평가를 받아요.', '좋은 사람을 만나 힘을 얻는 하루예요.'],
  ],
  money: [
    ['충동구매를 조심하세요. 장바구니에 담아 두고 내일 다시 보세요.', '빌려주는 돈은 돌려받기 어려울 수 있어요.', '작은 지출이 쌓이기 쉬운 날, 커피 한 잔도 한 번 더 생각해요.', '큰 결정은 미루는 게 좋아요. 정보를 더 모아 보세요.'],
    ['들어오고 나가는 돈이 비슷한 무난한 날이에요.', '가계부를 정리하면 새는 돈이 보여요.', '필요한 것만 사면 만족스러운 소비가 돼요.', '할인·포인트를 챙기면 소소한 이득이 있어요.'],
    ['생각지 못한 용돈이나 혜택이 생길 수 있어요.', '정보 하나가 돈이 되는 날, 귀를 열어 두세요.', '그동안의 노력이 보상으로 돌아와요.', '저축이나 투자 계획을 세우기 좋은 날이에요.'],
  ],
  love: [
    ['말 한마디에 서운함이 생길 수 있어요. 오늘은 들어 주는 쪽이 되어 보세요.', '혼자만의 시간이 필요한 날, 무리해서 만나지 않아도 돼요.', '지난 일을 꺼내면 다툼이 될 수 있어요.', '상대의 바쁜 사정을 이해해 주면 관계가 단단해져요.'],
    ['편안하고 잔잔한 하루, 안부 메시지 하나가 마음을 따뜻하게 해요.', '함께 밥 한 끼 먹는 것만으로 충분한 날이에요.', '오래된 친구와의 연락이 즐거움을 줘요.', '작은 칭찬이 큰 힘이 되는 날이에요.'],
    ['매력이 돋보이는 날, 새로운 인연이 다가올 수 있어요.', '마음을 표현하기 좋은 날이에요. 용기 내 보세요.', '연인과 특별한 추억을 만들 수 있어요.', '주변에서 호감을 표시하는 사람이 있어요.'],
  ],
  work: [
    ['꼼꼼히 확인하지 않으면 실수가 생길 수 있어요. 두 번 보세요.', '집중이 잘 안 되는 날, 짧게 끊어서 하는 게 효율적이에요.', '남의 일에 휘말리기 쉬워요. 내 할 일부터 챙기세요.', '중요한 발표나 시험은 준비를 한 번 더 점검하세요.'],
    ['맡은 일을 차근차근 하면 무난하게 마무리돼요.', '복습하기 좋은 날, 배운 걸 정리해 보세요.', '동료와 의견을 나누면 더 좋은 방법이 보여요.', '평소 실력대로 하면 충분한 날이에요.'],
    ['머리가 맑아 어려운 문제도 잘 풀려요.', '아이디어가 반짝이는 날, 메모해 두세요.', '노력한 만큼 인정받는 날이에요.', '새로운 공부나 일을 시작하기 좋아요.'],
  ],
  health: [
    ['피로가 쌓이기 쉬워요. 오늘은 일찍 잠자리에 드세요.', '과식·과음을 조심하세요. 속이 편한 음식이 좋아요.', '목·어깨가 뻐근할 수 있어요. 틈틈이 스트레칭하세요.', '환절기 감기를 조심하세요. 따뜻하게 입으세요.'],
    ['컨디션이 평소와 비슷해요. 물을 자주 마셔 주세요.', '가벼운 산책이 기분 전환에 좋아요.', '규칙적인 식사가 건강을 지켜 줘요.', '눈을 자주 쉬게 해 주세요.'],
    ['몸이 가볍고 활력이 넘쳐요. 운동하기 좋은 날이에요.', '잠을 푹 자서 컨디션이 최고예요.', '새로운 운동을 시작하기 좋은 날이에요.', '얼굴에 생기가 돌아 좋은 인상을 줘요.'],
  ],
};
const WORDS = ['천천히 가도 멈추지만 않으면 돼요.', '오늘의 작은 친절이 내일 큰 복으로 돌아와요.', '웃는 얼굴이 최고의 부적이에요.', '생각만 하던 일을 하나만 해 보세요.', '나를 칭찬하는 하루를 보내세요.', '지나간 일은 흘려보내고 지금에 집중해요.', '좋은 소식은 기다리는 사람에게 와요.', '모르는 건 물어보는 게 이기는 길이에요.', '정리 정돈이 운을 부르는 날이에요.', '오늘 만나는 사람에게 먼저 인사해 보세요.', '물 한 잔의 여유가 하루를 바꿔요.', '작은 목표 하나를 이루면 충분히 잘한 거예요.'];
const LUCKY_COLORS = ['빨간색', '주황색', '노란색', '초록색', '파란색', '남색', '보라색', '흰색', '검은색', '분홍색', '하늘색', '베이지색'];
const LUCKY_ITEMS = ['손수건', '볼펜', '따뜻한 차', '이어폰', '동전', '향기 나는 핸드크림', '작은 수첩', '초콜릿', '머리끈', '모자', '반지', '책 한 권'];
const DIRECTIONS = ['동쪽', '서쪽', '남쪽', '북쪽', '동남쪽', '동북쪽', '서남쪽', '서북쪽'];
const YEAR_LINES = ['기다리던 연락이 와요.', '작은 선물을 받을 수 있어요.', '오늘은 말을 아끼는 게 좋아요.', '도움을 청하면 기꺼이 손을 내밀어 줘요.', '정리하다가 잃어버린 물건을 찾아요.', '새로운 취미에 관심이 생겨요.', '가까운 사람과 웃을 일이 생겨요.', '계획을 세우면 술술 풀려요.', '무리한 일정은 줄이세요.', '좋은 정보를 얻게 돼요.', '건강을 챙기면 좋은 날이에요.', '오래된 고민이 풀려요.', '칭찬을 듣는 하루예요.', '서두르지 말고 순서를 지키세요.', '맛있는 걸 먹게 되는 날이에요.', '마음먹은 일을 시작하기 좋아요.', '지갑을 잘 챙기세요.', '반가운 사람을 만나요.', '휴식이 보약인 날이에요.', '기대하지 않던 곳에서 기회가 와요.'];

// 띠와 오늘 일진(지지)의 관계 → 단계
const SIX_HARMONY = [[0, 1], [2, 11], [3, 10], [4, 9], [5, 8], [6, 7]];
const THREE_HARMONY = [[8, 0, 4], [2, 6, 10], [5, 9, 1], [11, 3, 7]];
function animalTone(b, todayB) {
  if (SIX_HARMONY.some(([x, y]) => (x === b && y === todayB) || (y === b && x === todayB))) return { tone: 2, why: '오늘 일진과 서로 끌어 주는 육합(六合)이라 기운이 좋아요.' };
  if (b !== todayB && THREE_HARMONY.some((g) => g.includes(b) && g.includes(todayB))) return { tone: 2, why: '오늘 일진과 힘을 모으는 삼합(三合)이라 일이 잘 풀려요.' };
  if ((b + 6) % 12 === todayB) return { tone: 0, why: '오늘 일진과 부딪히는 충(沖)이라 조심하면 좋은 날이에요.' };
  if (b === todayB) return { tone: 1, why: '오늘 일진과 같은 띠라 내 기운이 또렷한 날이에요.' };
  return { tone: 1, why: '오늘 일진과 무난한 관계라 평소대로 가면 좋아요.' };
}

// 하루 운세 묶음 (띠·별자리 공용)
function dailyFortune(key, baseTone) {
  const ymd = todayYmd();
  const rnd = seeded(ymdKey(ymd) + '|' + key);
  const cats = CATS.map((c) => {
    let t = baseTone;
    const r = rnd();
    if (r < 0.22) t -= 1;
    else if (r > 0.78) t += 1;
    t = Math.max(0, Math.min(2, t));
    const stars = Math.max(1, Math.min(5, t * 2 + 1 + (rnd() < 0.5 ? 0 : 1)));
    return { ...c, tone: t, stars, text: pickOf(rnd, LINES[c.id][t]) };
  });
  return {
    cats,
    word: pickOf(rnd, WORDS),
    color: pickOf(rnd, LUCKY_COLORS),
    number: 1 + Math.floor(rnd() * 9) + (rnd() < 0.4 ? 10 * (1 + Math.floor(rnd() * 4)) : 0),
    item: pickOf(rnd, LUCKY_ITEMS),
    dir: pickOf(rnd, DIRECTIONS),
    rnd,
  };
}
const starsHtml = (n) => `<span class="ft-stars" aria-label="5점 중 ${n}점">${'★'.repeat(n)}<i>${'★'.repeat(5 - n)}</i></span>`;

/* ───────── 타로 (메이저 아르카나 22장) ───────── */

// [이름, 영어, 그림, 정방향 키워드, 정방향 풀이, 역방향 키워드, 역방향 풀이]
const TAROT = [
  ['바보', 'The Fool', '🎒', '새 출발·자유', '두려움 없이 새로운 길에 첫발을 내딛는 때예요. 계산보다 설렘을 믿어 보세요.', '무모함·망설임', '준비 없이 뛰어들면 헛걸음이 될 수 있어요. 한 번만 더 살펴보세요.'],
  ['마법사', 'The Magician', '🪄', '능력·시작', '필요한 재료는 이미 다 갖췄어요. 마음먹은 일을 실행으로 옮길 때예요.', '재주 낭비·속임수', '말만 앞서거나 재능을 엉뚱한 데 쓰고 있지 않은지 돌아보세요.'],
  ['여사제', 'The High Priestess', '🌙', '직감·지혜', '겉으로 드러나지 않은 답이 있어요. 조용히 마음의 목소리에 귀 기울이세요.', '혼란·비밀', '감정이 판단을 흐리고 있어요. 확실해질 때까지 결정을 미루세요.'],
  ['여황제', 'The Empress', '🌾', '풍요·사랑', '정성 들인 일이 열매를 맺어요. 사랑과 여유가 넘치는 시기예요.', '게으름·과보호', '편안함에 안주하면 성장이 멈춰요. 나를 너무 아끼다 기회를 놓치지 마세요.'],
  ['황제', 'The Emperor', '👑', '안정·리더십', '계획과 규칙이 힘이 되는 때예요. 주도권을 잡고 이끌어 보세요.', '고집·통제', '내 방식만 고집하면 사람들이 멀어져요. 조금 유연해지세요.'],
  ['교황', 'The Hierophant', '🔑', '조언·전통', '믿을 만한 선배나 스승의 조언이 길을 밝혀 줘요. 기본에 충실하세요.', '틀에 갇힘', '남들 기준에 맞추느라 내 생각을 잃고 있어요. 나만의 방식을 찾아보세요.'],
  ['연인', 'The Lovers', '💞', '사랑·선택', '마음이 통하는 사람과 좋은 관계를 맺어요. 중요한 선택은 진심을 따르세요.', '갈등·망설임', '마음이 둘로 나뉘어 있어요. 무엇이 진짜 중요한지 정리해 보세요.'],
  ['전차', 'The Chariot', '🏇', '전진·승리', '목표를 향해 힘차게 나아갈 때예요. 의지만 있으면 이겨 내요.', '방향 잃음', '힘은 있는데 방향이 흔들려요. 목표를 다시 확인하세요.'],
  ['힘', 'Strength', '🦁', '용기·인내', '부드러운 힘이 거친 상황을 다스려요. 참을성이 결국 이겨요.', '자신감 부족', '스스로를 믿지 못해 주저하고 있어요. 생각보다 당신은 강해요.'],
  ['은둔자', 'The Hermit', '🏮', '성찰·탐구', '잠시 혼자만의 시간을 가지며 답을 찾을 때예요. 천천히 깊게 생각하세요.', '고립·외로움', '혼자 끙끙 앓고 있지 않나요? 가까운 사람에게 마음을 열어 보세요.'],
  ['운명의 수레바퀴', 'Wheel of Fortune', '🎡', '전환점·행운', '흐름이 바뀌는 시기예요. 찾아온 기회를 놓치지 마세요.', '엇갈림', '타이밍이 조금 어긋나요. 지금은 흐름을 지켜보며 기다리세요.'],
  ['정의', 'Justice', '⚖️', '공정·균형', '뿌린 대로 거두는 때예요. 정직하게 판단하면 좋은 결과가 와요.', '불공평·편견', '한쪽 말만 듣고 판단하고 있지 않나요? 균형을 되찾으세요.'],
  ['매달린 사람', 'The Hanged Man', '🙃', '관점 전환', '잠시 멈추고 다른 시선으로 보면 새로운 답이 보여요.', '헛된 희생', '의미 없는 기다림이 길어지고 있어요. 이제 움직일 때예요.'],
  ['죽음', 'Death', '🦋', '끝과 시작', '무서운 카드가 아니에요. 낡은 것을 정리하고 새롭게 태어나는 변화의 때예요.', '변화 거부', '끝내야 할 것을 붙잡고 있어요. 놓아야 새것이 들어와요.'],
  ['절제', 'Temperance', '🏺', '조화·균형', '서두르지 않고 적당히 섞는 지혜가 필요해요. 조화가 행운을 불러요.', '과함·불균형', '한쪽으로 너무 치우쳐 있어요. 생활의 균형을 되찾으세요.'],
  ['악마', 'The Devil', '😈', '유혹·집착', '달콤한 유혹이나 나쁜 습관에 끌리기 쉬워요. 무엇에 묶여 있는지 살펴보세요.', '해방', '얽매였던 것에서 벗어날 힘이 생겨요. 끊어 낼 용기를 내세요.'],
  ['탑', 'The Tower', '⚡', '급변·깨달음', '예상 못 한 변화가 와도 무너진 자리에 더 단단한 것이 세워져요.', '위기 모면', '큰 위기는 피했지만 경고로 받아들이세요. 미리 대비하면 괜찮아요.'],
  ['별', 'The Star', '⭐', '희망·회복', '힘든 시간이 지나고 희망이 보여요. 꿈을 향해 다시 걸어가세요.', '실망·의심', '기대가 꺾여 지쳐 있어요. 작은 목표부터 다시 세워 보세요.'],
  ['달', 'The Moon', '🌕', '불안·상상', '확실하지 않은 일에 마음이 흔들려요. 소문보다 사실을 확인하세요.', '혼란 해소', '헷갈리던 일이 점점 분명해져요. 진실이 드러나요.'],
  ['태양', 'The Sun', '☀️', '성공·기쁨', '모든 게 밝게 빛나는 최고의 카드예요. 자신 있게 나아가세요.', '잠깐의 흐림', '좋은 흐름이지만 들뜨지 마세요. 작은 걸림돌은 금방 지나가요.'],
  ['심판', 'Judgement', '📯', '부활·결단', '오래 기다린 소식이 오거나 다시 도전할 기회가 와요.', '미련·후회', '지난 일에 대한 후회가 발목을 잡아요. 나를 용서하고 앞으로 가세요.'],
  ['세계', 'The World', '🌍', '완성·성취', '노력이 완성되는 때예요. 한 단계가 끝나고 더 큰 무대가 기다려요.', '마무리 부족', '거의 다 왔어요. 마지막 정리를 꼼꼼히 해야 완성돼요.'],
];
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

// 띠·별자리 설명 (화면과 정적 페이지 공용)
const ANIMAL_MORE = {
  rat: ['위기에 강하고 돈 관리를 잘해요', '걱정이 많아지면 기회 앞에서 망설일 수 있어요'],
  ox: ['맡은 일을 끝까지 책임져요', '한번 정하면 잘 바꾸지 않아 고집스러워 보일 수 있어요'],
  tiger: ['앞장서서 분위기를 이끌어요', '성급하게 결정하면 뒷수습이 길어져요'],
  rabbit: ['갈등을 부드럽게 풀어요', '싫은 소리를 못 해 혼자 끙끙 앓기 쉬워요'],
  dragon: ['큰 그림을 그리고 사람을 모아요', '자신감이 지나치면 주변 조언을 놓쳐요'],
  snake: ['상황을 읽고 때를 기다릴 줄 알아요', '속마음을 숨기다 오해를 살 수 있어요'],
  horse: ['어디서든 빨리 적응하고 활기를 줘요', '금방 싫증 내면 마무리가 약해져요'],
  sheep: ['사람을 편하게 하고 감각이 좋아요', '남의 눈치를 보느라 내 결정을 미루기 쉬워요'],
  monkey: ['어려운 문제도 재치로 풀어요', '여러 일을 벌이면 집중이 흩어져요'],
  rooster: ['계획을 세우고 꼼꼼히 챙겨요', '작은 흠까지 지적하면 사람이 지칠 수 있어요'],
  dog: ['약속을 지키고 내 사람을 챙겨요', '걱정과 의심이 많아지면 스스로 힘들어져요'],
  pig: ['너그럽고 함께 있으면 편안해요', '사람을 쉽게 믿고 씀씀이가 커질 수 있어요'],
};
const SIGN_MORE = {
  aries: ['화성', '시작이 빠르고 결단력이 있어요', '끝까지 기다리는 인내심을 기르면 좋아요'],
  taurus: ['금성', '꾸준하고 믿음직해요', '변화를 너무 늦게 받아들일 수 있어요'],
  gemini: ['수성', '말과 글로 사람을 잘 이어요', '관심이 자주 옮겨 가 마무리가 약할 수 있어요'],
  cancer: ['달', '사람을 살뜰히 챙겨요', '서운함을 오래 담아 두기 쉬워요'],
  leo: ['태양', '자신감으로 주변을 밝혀요', '인정받지 못하면 쉽게 상처받아요'],
  virgo: ['수성', '세심하고 실수를 잘 잡아내요', '완벽을 바라다 스스로를 몰아붙여요'],
  libra: ['금성', '공정하고 대화로 잘 풀어요', '결정을 오래 망설이는 편이에요'],
  scorpio: ['명왕성(전통적으로 화성)', '깊이 파고드는 집중력이 있어요', '한번 생긴 의심을 잘 놓지 못해요'],
  sagittarius: ['목성', '긍정적이고 시야가 넓어요', '솔직한 말이 상처가 될 때가 있어요'],
  capricorn: ['토성', '목표를 세우고 꾸준히 올라가요', '일에 몰두하다 쉬는 법을 잊어요'],
  aquarius: ['천왕성(전통적으로 토성)', '새로운 생각을 잘 떠올려요', '감정 표현이 차갑게 보일 수 있어요'],
  pisces: ['해왕성(전통적으로 목성)', '남의 마음을 잘 헤아려요', '현실을 피하고 싶을 때가 많아져요'],
};
function animalAboutHtml(a) {
  const nameOf = (b) => ANIMALS.find((x) => x.b === b).name + '띠';
  const six = SIX_HARMONY.find((p) => p.includes(a.b)).find((x) => x !== a.b);
  const three = THREE_HARMONY.find((g) => g.includes(a.b)).filter((x) => x !== a.b);
  const [good, care] = ANIMAL_MORE[a.id];
  return `<section class="about">
    <h2>${a.name}띠는 어떤 사람?</h2>
    <p>${esc(a.trait)}</p><p><b>강점</b> ${good}. <b>조심할 점</b> ${care}.</p>
    <h3>${a.name}띠와 잘 맞는 띠</h3>
    <p>전통적으로 ${nameOf(six)}와는 서로 끌어 주는 육합, ${three.map(nameOf).join('·')}와는 힘을 모으는 삼합이라고 봐요. 반대로 ${nameOf((a.b + 6) % 12)}와는 기운이 부딪히는 충으로 봐요. 그래서 그날의 일진이 ${nameOf((a.b + 6) % 12).replace('띠', '')}에 해당하는 날에는 ${a.name}띠의 운세가 조심하는 쪽으로 나와요.</p>
    <h3>${a.name}띠는 몇 년생?</h3>
    <p>${animalYears(a).filter((y) => y >= 1936 && y <= 2031).join('·')}년에 태어난 사람이에요. 띠는 보통 설날이나 입춘을 기준으로 바뀌어서, 1월이나 2월 초에 태어났다면 앞 해의 띠일 수 있어요.</p>
    <p>이 페이지의 오늘의 운세는 ${a.name}띠와 그날 일진의 관계를 바탕으로 맞혀봐가 정리한 재미용 콘텐츠예요.</p>
  </section>`;
}
function signAboutHtml(s) {
  const [ruler, good, care] = SIGN_MORE[s.id];
  const mates = SIGNS.filter((x) => x.el === s.el && x.id !== s.id).map((x) => x.name);
  return `<section class="about">
    <h2>${s.name}는 어떤 사람?</h2>
    <p>${esc(s.trait)}</p><p><b>강점</b> ${good}. <b>조심할 점</b> ${care}.</p>
    <h3>${s.name}의 수호성과 원소</h3>
    <p>${s.name}는 ${signRange(s)}에 태어난 사람의 별자리예요. 서양 점성술에서 수호성은 ${ruler}이고 네 원소 가운데 ${s.el}에 속해요. 같은 ${s.el}의 별자리인 ${mates.join('·')}와는 성향이 잘 통한다고 봐요.</p>
    <p>별자리 경계일은 해마다 하루쯤 달라질 수 있어요. 이 페이지의 오늘의 운세는 맞혀봐가 정리한 재미용 콘텐츠예요.</p>
  </section>`;
}
const SAJU_ABOUT = `<section class="about"><h2>사주팔자란?</h2><p>사주(四柱)는 태어난 해·달·날·시간의 네 기둥이고, 기둥마다 천간과 지지 두 글자가 있어 모두 여덟 글자(팔자)가 돼요. 여덟 글자에 담긴 나무(목)·불(화)·흙(토)·쇠(금)·물(수) 다섯 기운의 균형으로 타고난 성향을 보고, 태어난 날의 천간(일간)을 '나'로 삼아 오늘의 일진과 어떤 관계인지 풀어 줘요.</p><h3>오행은 서로 어떻게 작용할까?</h3><p>나무는 불을 살리고, 불은 재가 되어 흙을 만들고, 흙에서 쇠가 나고, 쇠에 물방울이 맺히고, 물은 나무를 키워요. 이렇게 서로 돕는 관계가 상생이에요. 반대로 나무는 흙의 양분을 빼앗고, 흙은 물을 막고, 물은 불을 끄고, 불은 쇠를 녹이고, 쇠는 나무를 베어요. 이 관계가 상극이에요.</p><h3>이 계산의 한계</h3><p>월주는 절기(입춘·경칩 등) 날짜로 나누는데, 절기가 시작되는 시각까지는 따지지 않아 경계일에 태어났다면 하루 차이가 날 수 있어요. 음력 생일은 양력으로 바꿔서 넣어 주세요. 입력한 생년월일은 이 기기에만 저장되고 어디로도 보내지 않아요. 사주는 재미로만 봐 주세요.</p></section>`;
const LOTTO_ABOUT = `<section class="about"><h2>로또 번호 생성기 사용법</h2><p>게임 수를 고르고 '번호 뽑기'를 누르면 1~45 중 겹치지 않는 6개 번호를 무작위로 뽑아 줘요. 꼭 넣고 싶은 번호나 빼고 싶은 번호도 정할 수 있어요. 뽑은 번호마다 합계·홀짝·연속 번호를 분석하고, 그 번호로 매주 샀다고 치고 실제로 추첨을 돌려 보는 모의실험도 할 수 있어요.</p><h3>당첨 확률은 어떻게 계산할까?</h3><p>45개에서 6개를 고르는 조합은 8,145,060가지이고, 1등은 그중 하나예요. 2등은 맞힌 5개와 보너스 번호가 필요해서 6가지, 3등은 5개를 맞히는 경우 234가지에서 2등 6가지를 뺀 228가지예요. 4등은 내 번호 6개 중 4개와 나머지 39개 중 2개를 고르는 11,115가지, 5등은 182,780가지예요. 다섯 등수를 모두 더하면 194,130가지라서 뭐라도 당첨될 확률은 약 2.38%예요.</p><h3>번호를 잘 고르면 확률이 올라갈까?</h3><p>아니에요. 추첨은 매번 독립이라 지난 당첨 번호나 자주 나온 번호는 다음 추첨에 영향을 주지 않아요. 생성기가 보여 주는 합계·홀짝 분석도 그 조합이 어떤 모양인지 알려 줄 뿐 확률을 바꾸지 않아요. 로또는 만 19세 이상만 살 수 있고, 이 생성기는 재미로만 써 주세요.</p></section>`;

/* ───────── 화면 ───────── */

const isFortunePath = (path) => /^\/(fortune|saju|tarot|lotto)(\/|$)/.test(path);
const todayLabel = () => {
  const [y, m, d] = todayYmd();
  const g = ganji(dayIndex([y, m, d]));
  return `${m}월 ${d}일 · 오늘의 일진 ${ganjiName(g)}(${ganjiHanja(g)})일`;
};

function fortuneHead(title) {
  return `<div class="play-head"><button class="icon-btn" data-act="back" aria-label="뒤로">←</button><h1 class="page-title">${esc(title)}</h1></div>`;
}
function bindBack(back) {
  app.querySelector('[data-act="back"]')?.addEventListener('click', () => nav(back));
}

async function shareFortune(text, url) {
  if (navigator.share) {
    try {
      await navigator.share({ title: '맞혀봐 운세', text, url });
      return;
    } catch (e) {
      if (e.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    toast('글과 링크를 복사했어요');
  } catch {
    prompt('아래 글을 복사해서 보내세요', `${text}\n${url}`);
  }
}

function renderFortuneRoute(path) {
  play = null;
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'saju') return renderSaju();
  if (parts[0] === 'tarot') return renderTarot();
  if (parts[0] === 'lotto') return renderLotto();
  if (parts[1]) {
    const a = ANIMALS.find((x) => x.id === parts[1]);
    if (a) return renderAnimal(a);
    const s = SIGNS.find((x) => x.id === parts[1]);
    if (s) return renderSign(s);
  }
  renderFortuneHome();
}

function renderFortuneHome() {
  document.title = '오늘의 운세 · 사주 · 타로 · 맞혀봐';
  const now = new Date();
  const mySign = SIGNS.find((s) => inSign(s, now.getMonth() + 1, now.getDate()));
  app.innerHTML = `
    <section class="hero">
      <h1>🔮 오늘의 운세</h1>
      <p>${todayLabel()} · 재미로 보는 띠별·별자리 운세와 사주, 타로</p>
    </section>
    <div class="ft-big">
      <a class="ft-big-card saju" href="/saju/"><b>🀄 사주팔자</b><span>생년월일시로 보는 내 사주와 오늘의 기운</span></a>
      <a class="ft-big-card tarot" href="/tarot/"><b>🃏 타로 한 장</b><span>마음속 질문을 떠올리고 카드를 뽑아 보세요</span></a>
      <a class="ft-big-card lotto" href="/lotto/"><b>🎱 로또 번호 생성기</b><span>번호 뽑기 + 진짜 당첨 확률 분석</span></a>
    </div>
    <section class="home-sec">
      <div class="sec-head"><h2 class="sec-title">🐾 띠별 오늘의 운세</h2></div>
      <div class="ft-grid">${ANIMALS.map((a) => {
        const f = dailyFortune('animal-' + a.id, animalTone(a.b, ganji(dayIndex(todayYmd())).b).tone);
        return `<a class="ft-cell" href="/fortune/${a.id}/"><span class="ft-emoji">${a.emoji}</span><b>${a.name}띠</b>${starsHtml(f.cats[0].stars)}</a>`;
      }).join('')}</div>
    </section>
    <section class="home-sec">
      <div class="sec-head"><h2 class="sec-title">✨ 별자리 운세</h2></div>
      <div class="ft-grid">${SIGNS.map((s) => {
        const f = signFortune(s);
        return `<a class="ft-cell${s === mySign ? ' now' : ''}" href="/fortune/${s.id}/"><span class="ft-emoji">${s.emoji}</span><b>${s.name}</b>${starsHtml(f.cats[0].stars)}</a>`;
      }).join('')}</div>
    </section>
    <section class="about">
      <h2>재미로 보는 오늘의 운세</h2>
      <p>띠별 운세는 태어난 해의 띠와 오늘의 일진(날마다 바뀌는 60갑자)이 서로 끌어 주는지(합), 부딪히는지(충)를 보고 정해요. 별자리 운세는 태어난 날짜의 별자리로 보는 하루 운세예요. 같은 날에는 누구에게나 같은 운세가 나오고, 자정이 지나면 새 운세로 바뀌어요.</p>
      <p>사주팔자는 생년월일과 태어난 시간으로 여덟 글자(연주·월주·일주·시주)를 계산해 타고난 오행의 균형과 오늘의 기운을 알려 줘요. 입력한 생년월일은 이 기기에만 저장되고 어디로도 보내지 않아요. 모든 운세는 재미로만 봐 주세요.</p>
    </section>
    ${SITE_FOOT}`;
}

function inSign(s, m, d) {
  const n = m * 100 + d;
  const a = s.from[0] * 100 + s.from[1];
  const b = s.to[0] * 100 + s.to[1];
  return a <= b ? n >= a && n <= b : n >= a || n <= b;
}
function signFortune(s) {
  const rnd = seeded(ymdKey(todayYmd()) + '|tone|' + s.id);
  const r = rnd();
  return dailyFortune('sign-' + s.id, r < 0.25 ? 0 : r < 0.7 ? 1 : 2);
}

function fortuneBody(f, extraTop, shareText, url) {
  return `
    ${extraTop}
    <div class="ft-cats">${f.cats.map((c) => `
      <div class="ft-cat tone-${c.tone}">
        <div class="ft-cat-head"><span>${c.icon} ${c.label}</span>${starsHtml(c.stars)}</div>
        <p>${esc(c.text)}</p>
      </div>`).join('')}</div>
    <div class="ft-lucky">
      <div><span>행운의 색</span><b>${f.color}</b></div>
      <div><span>행운의 숫자</span><b>${f.number}</b></div>
      <div><span>행운의 방향</span><b>${f.dir}</b></div>
      <div><span>행운의 물건</span><b>${f.item}</b></div>
    </div>
    <p class="ft-word">💬 ${esc(f.word)}</p>
    <div class="game-actions"><button class="btn block" data-act="share">📣 친구한테 운세 보내기</button><a class="btn ghost block" href="/fortune/">다른 운세 보기</a></div>
    <p class="ft-note">재미로 보는 운세예요. 날짜가 바뀌면 새 운세가 나와요.</p>`;
}

function renderAnimal(a) {
  const today = ganji(dayIndex(todayYmd()));
  const { tone, why } = animalTone(a.b, today.b);
  const f = dailyFortune('animal-' + a.id, tone);
  document.title = `${a.name}띠 오늘의 운세 · 맞혀봐`;
  const years = animalYears(a).filter((y) => y >= 1948 && y <= 2020).reverse();
  const yearLines = years.map((y) => `<li><b>${String(y).slice(2)}년생</b> ${esc(pickOf(f.rnd, YEAR_LINES))}</li>`).join('');
  const top = `
    <div class="ft-hero"><span class="ft-emoji big">${a.emoji}</span><div><b>${a.name}띠</b><span>${todayLabel()}</span></div></div>
    <p class="ft-why">${why}</p>`;
  app.innerHTML = `${fortuneHead(`${a.name}띠 오늘의 운세`)}
    <div class="ft-page">${fortuneBody(f, top)}
      <h2 class="ft-sub">나이별 한 줄 운세</h2>
      <ul class="ft-years">${yearLines}</ul>
    </div>
    ${animalAboutHtml(a)}
    ${SITE_FOOT}`;
  bindBack('/fortune/');
  app.querySelector('[data-act="share"]').addEventListener('click', () =>
    shareFortune(`${a.emoji} ${a.name}띠 오늘의 운세: 총운 ${'★'.repeat(f.cats[0].stars)} "${f.cats[0].text}"`, `${location.origin}/fortune/${a.id}/`)
  );
}

function renderSign(s) {
  const f = signFortune(s);
  document.title = `${s.name} 오늘의 운세 · 맞혀봐`;
  const top = `<div class="ft-hero"><span class="ft-emoji big">${s.emoji}</span><div><b>${s.name}</b><span>${signRange(s)} · ${s.el}의 별자리</span></div></div>`;
  app.innerHTML = `${fortuneHead(`${s.name} 오늘의 운세`)}
    <div class="ft-page">${fortuneBody(f, top)}</div>
    ${signAboutHtml(s)}
    ${SITE_FOOT}`;
  bindBack('/fortune/');
  app.querySelector('[data-act="share"]').addEventListener('click', () =>
    shareFortune(`${s.emoji} ${s.name} 오늘의 운세: 총운 ${'★'.repeat(f.cats[0].stars)} "${f.cats[0].text}"`, `${location.origin}/fortune/${s.id}/`)
  );
}

/* ───────── 사주 ───────── */

const HOURS = ['자시 (23:30~01:29)', '축시 (01:30~03:29)', '인시 (03:30~05:29)', '묘시 (05:30~07:29)', '진시 (07:30~09:29)', '사시 (09:30~11:29)', '오시 (11:30~13:29)', '미시 (13:30~15:29)', '신시 (15:30~17:29)', '유시 (17:30~19:29)', '술시 (19:30~21:29)', '해시 (21:30~23:29)'];
const DAY_MASTER = {
  갑: '큰 나무처럼 곧고 위로 뻗어 가는 사람. 리더십과 추진력이 있고 한번 정하면 밀고 나가요.',
  을: '덩굴과 꽃처럼 부드럽고 끈질긴 사람. 적응력이 좋고 사람 사이를 잘 이어요.',
  병: '태양처럼 밝고 뜨거운 사람. 솔직하고 열정적이라 어디서든 분위기를 살려요.',
  정: '촛불처럼 따뜻하고 섬세한 사람. 배려심이 깊고 한 가지에 깊이 몰입해요.',
  무: '큰 산처럼 듬직한 사람. 믿음직하고 포용력이 커서 사람들이 기대요.',
  기: '기름진 밭처럼 잘 길러 내는 사람. 실속 있고 꼼꼼하며 사람을 잘 챙겨요.',
  경: '단단한 바위·쇠처럼 강직한 사람. 의리 있고 결단력이 빨라요.',
  신: '보석처럼 반짝이는 사람. 감각이 예리하고 완벽을 추구해요.',
  임: '큰 바다처럼 넓은 사람. 생각이 깊고 아이디어가 풍부해요.',
  계: '이슬비처럼 촉촉한 사람. 직관이 뛰어나고 조용히 주변을 적셔 줘요.',
};
const REL_TODAY = {
  비겁: ['나와 같은 기운이 들어오는 날', '자신감이 올라가요. 다만 고집이 세지기 쉬우니 함께하는 사람 말도 들어 보세요. 친구·동료와 힘을 합치면 좋아요.'],
  식상: ['내 기운이 밖으로 표현되는 날', '말과 아이디어가 술술 나와요. 글쓰기·발표·창작에 좋고, 하고 싶은 말이 많아도 한 번 걸러서 하세요.'],
  재성: ['재물과 결과를 거두는 날', '돈과 기회의 흐름이 보여요. 계산이 잘 맞는 날이니 정리·쇼핑·계약 검토에 좋아요. 욕심은 조금만!'],
  관성: ['책임과 평가가 따르는 날', '일·직장에서 맡는 몫이 커질 수 있어요. 규칙을 지키면 인정받고, 무리하면 피곤해져요.'],
  인성: ['도움과 배움이 들어오는 날', '윗사람·선배의 도움이나 좋은 정보를 얻어요. 공부·자격증·독서에 집중하기 좋아요.'],
};

function renderSaju() {
  document.title = '사주팔자 보기 · 맞혀봐';
  const saved = gameStore.get('saju') || {};
  app.innerHTML = `${fortuneHead('사주팔자 보기')}
    <form class="ft-form">
      <label class="field"><span>생년월일 (양력)</span><input type="date" name="birth" min="1930-01-01" max="2030-12-31" value="${esc(saved.birth || '')}" required></label>
      <label class="field"><span>태어난 시간</span><select name="hour"><option value="">모름</option>${HOURS.map((h, i) => `<option value="${i}"${String(saved.hour) === String(i) ? ' selected' : ''}>${h}</option>`).join('')}</select></label>
      <button class="btn block">내 사주 보기</button>
      <p class="ft-note">입력한 생년월일은 이 기기에만 저장되고 어디로도 보내지 않아요. 음력 생일은 양력으로 바꿔서 넣어 주세요.</p>
    </form>
    <div class="ft-result"></div>
    ${SAJU_ABOUT}
    ${SITE_FOOT}`;
  bindBack('/fortune/');
  const form = app.querySelector('form');
  const show = () => {
    const [y, m, d] = form.birth.value.split('-').map(Number);
    if (!y) return;
    const hour = form.hour.value === '' ? null : Number(form.hour.value);
    gameStore.save('saju', { birth: form.birth.value, hour: form.hour.value });
    renderSajuResult(app.querySelector('.ft-result'), [y, m, d], hour);
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    show();
    app.querySelector('.ft-result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  if (saved.birth) show();
}

function renderSajuResult(box, ymd, hour) {
  const p = sajuPillars(ymd, hour);
  const cols = [['시주', p.hour], ['일주', p.day], ['월주', p.month], ['연주', p.year]];
  const count = Object.fromEntries(ELEMENTS.map((e) => [e, 0]));
  cols.forEach(([, g]) => {
    if (!g) return;
    count[STEMS[g.s][2]]++;
    count[BRANCHES[g.b][2]]++;
  });
  const total = Object.values(count).reduce((a, b) => a + b, 0);
  const me = STEMS[p.day.s];
  const lack = ELEMENTS.filter((e) => count[e] === 0);
  const strong = ELEMENTS.filter((e) => count[e] >= 3);
  const today = ganji(dayIndex(todayYmd()));
  const rel = relation(me[2], STEMS[today.s][2]);
  const animal = ANIMALS.find((a) => a.b === p.year.b);
  const cell = (g, label) =>
    g
      ? `<div class="sj-col"><span class="sj-label">${label}</span>
          <b class="sj-char" style="--c:${ELEMENT_INFO[STEMS[g.s][2]].color}">${STEMS[g.s][1]}<small>${STEMS[g.s][0]}·${STEMS[g.s][2]}</small></b>
          <b class="sj-char" style="--c:${ELEMENT_INFO[BRANCHES[g.b][2]].color}">${BRANCHES[g.b][1]}<small>${BRANCHES[g.b][0]}·${BRANCHES[g.b][2]}</small></b></div>`
      : `<div class="sj-col"><span class="sj-label">${label}</span><b class="sj-char none">?<small>시간 모름</small></b><b class="sj-char none">?<small>　</small></b></div>`;
  box.innerHTML = `
    <div class="ft-page">
      <div class="sj-table">${cols.map(([l, g]) => cell(g, l)).join('')}</div>
      <p class="ft-why">나는 <b>${me[0]}${STEMS[p.day.s][2]}(${me[1]})</b> 일간 · ${animal.name}띠 ${animal.emoji} · 일주 ${ganjiName(p.day)}</p>
      <h2 class="ft-sub">타고난 성향</h2>
      <p class="ft-text">${esc(DAY_MASTER[me[0]])}</p>
      <h2 class="ft-sub">오행 균형</h2>
      <div class="sj-bars">${ELEMENTS.map((e) => `<div class="sj-bar"><span>${ELEMENT_INFO[e].hanja} ${e}(${ELEMENT_INFO[e].name})</span><i style="width:${(count[e] / total) * 100}%;background:${ELEMENT_INFO[e].color}"></i><b>${count[e]}</b></div>`).join('')}</div>
      <p class="ft-text">${
        lack.length
          ? `<b>${lack.map((e) => `${e}(${ELEMENT_INFO[e].name})`).join('·')}</b> 기운이 비어 있어요. 채워 주는 방법: ${lack.map((e) => `${ELEMENT_INFO[e].lucky} 소품, ${ELEMENT_INFO[e].food}, ${ELEMENT_INFO[e].tip}`).join(' / ')}.`
          : '다섯 기운이 모두 들어 있어 균형이 좋은 사주예요.'
      } ${strong.length ? `<b>${strong.join('·')}</b> 기운이 강해서 그 성향이 잘 드러나요.` : ''}</p>
      <h2 class="ft-sub">오늘의 기운 · ${ganjiName(today)}일</h2>
      <div class="ft-cat tone-1"><div class="ft-cat-head"><span>✨ ${REL_TODAY[rel][0]}</span></div><p>${REL_TODAY[rel][1]}</p></div>
      <div class="game-actions"><button class="btn block" data-act="share">📣 친구 사주도 봐 주기</button><a class="btn ghost block" href="/fortune/${animal.id}/">${animal.name}띠 오늘의 운세</a></div>
      <p class="ft-note">월주는 절기 날짜로 계산해 경계일엔 하루 차이가 날 수 있어요. 재미로만 봐 주세요.</p>
    </div>`;
  box.querySelector('[data-act="share"]').addEventListener('click', () =>
    shareFortune(`나는 ${me[0]}${STEMS[p.day.s][2]} 일간! "${DAY_MASTER[me[0]].split('.')[0]}" 너의 사주는?`, `${location.origin}/saju/`)
  );
}

/* ───────── 타로 ───────── */

function tarotFace(i, reversed) {
  const c = TAROT[i];
  return `<div class="tr-face${reversed ? ' rev' : ''}"><span class="tr-num">${ROMAN[i]}</span><span class="tr-pic">${c[2]}</span><b>${c[0]}</b><small>${c[1]}</small></div>`;
}

function renderTarot() {
  document.title = '오늘의 타로 · 맞혀봐';
  const saved = gameStore.get('tarot') || { mode: 1 };
  let mode = saved.mode === 3 ? 3 : 1;
  app.innerHTML = `${fortuneHead('타로 카드 뽑기')}
    <div class="opt-row" role="group" aria-label="뽑는 장수">
      <button class="chip" data-mode="1">오늘의 타로 (1장)</button>
      <button class="chip" data-mode="3">과거·현재·미래 (3장)</button>
    </div>
    <p class="game-result tr-guide"></p>
    <div class="tr-deck"></div>
    <div class="tr-result"></div>
    <section class="about"><h2>타로 카드 보는 법</h2><p>마음속으로 궁금한 것 하나를 떠올린 뒤 끌리는 카드를 고르세요. 오늘의 타로는 한 장으로 하루의 흐름을, 세 장 뽑기는 순서대로 과거·현재·미래를 보여 줘요. 카드가 거꾸로 나오면(역방향) 그 의미가 약해지거나 반대로 작용한다는 뜻이에요.</p><p>메이저 아르카나 22장을 쓰고, 카드 그림은 맞혀봐가 직접 만든 그림이에요. 재미로만 봐 주세요.</p></section>
    ${SITE_FOOT}`;
  bindBack('/fortune/');
  const deck = app.querySelector('.tr-deck');
  const guide = app.querySelector('.tr-guide');
  const result = app.querySelector('.tr-result');
  let order = [];
  let picks = [];
  const setup = () => {
    order = shuffle([...Array(22).keys()]).map((i) => ({ i, rev: Math.random() < 0.3 }));
    picks = [];
    result.innerHTML = '';
    guide.textContent = mode === 1 ? '질문을 떠올리고 카드 한 장을 고르세요' : '과거 → 현재 → 미래 순서로 세 장을 고르세요';
    app.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', Number(b.dataset.mode) === mode));
    deck.innerHTML = order.map((_, k) => `<button class="tr-card" data-k="${k}" aria-label="${k + 1}번째 카드"><span class="tr-back"></span></button>`).join('');
  };
  app.querySelectorAll('[data-mode]').forEach((b) =>
    b.addEventListener('click', () => {
      mode = Number(b.dataset.mode);
      gameStore.save('tarot', { mode });
      setup();
    })
  );
  deck.addEventListener('click', (e) => {
    const btn = e.target.closest('.tr-card');
    if (!btn || btn.classList.contains('picked') || picks.length >= mode) return;
    const pick = order[Number(btn.dataset.k)];
    picks.push(pick);
    btn.classList.add('picked');
    btn.innerHTML = tarotFace(pick.i, pick.rev);
    sfx('pop');
    buzz(15);
    if (picks.length < mode) {
      guide.textContent = `${['과거', '현재', '미래'][picks.length]} 카드를 골라 주세요 (${picks.length}/3)`;
      return;
    }
    deck.querySelectorAll('.tr-card:not(.picked)').forEach((b) => b.classList.add('dim'));
    guide.textContent = '카드를 해석했어요 👇';
    const labels = mode === 1 ? ['오늘의 카드'] : ['과거', '현재', '미래'];
    result.innerHTML = `
      <div class="tr-spread">${picks.map((p, k) => `<div class="tr-slot"><span>${labels[k]}</span>${tarotFace(p.i, p.rev)}</div>`).join('')}</div>
      ${picks.map((p, k) => {
        const c = TAROT[p.i];
        return `<div class="ft-cat tone-${p.rev ? 0 : 2}"><div class="ft-cat-head"><span>${labels[k]} · ${c[0]} ${p.rev ? '(역방향)' : '(정방향)'}</span><em>${p.rev ? c[5] : c[3]}</em></div><p>${p.rev ? c[6] : c[4]}</p></div>`;
      }).join('')}
      <div class="game-actions"><button class="btn block" data-act="again">다시 뽑기</button><button class="btn ghost block" data-act="share">📣 결과 보내기</button></div>`;
    result.querySelector('[data-act="again"]').addEventListener('click', () => {
      setup();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    result.querySelector('[data-act="share"]').addEventListener('click', () =>
      shareFortune(`🃏 내가 뽑은 타로: ${picks.map((p) => `${TAROT[p.i][0]}${p.rev ? '(역)' : ''}`).join(' · ')}. 너도 한 장 뽑아 봐!`, `${location.origin}/tarot/`)
    );
    setTimeout(() => result.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
  });
  setup();
}

/* ───────── 로또 번호 생성기 + 확률 분석 ───────── */
// 로또 6/45: 1~45 중 6개 + 보너스 1개. 4등 5만 원·5등 5천 원은 고정, 1~3등은 회차마다 달라서 모의실험엔 평균 정도 금액을 씀

const LOTTO_TOTAL = 8145060; // 45C6
const comb = (n, k) => {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
};
// 등수별 경우의 수 (내 번호 6개 기준)
const LOTTO_RANKS = [
  { rank: 1, label: '1등', rule: '6개 모두', ways: 1, prize: 2000000000, fixed: false },
  { rank: 2, label: '2등', rule: '5개 + 보너스', ways: 6, prize: 60000000, fixed: false },
  { rank: 3, label: '3등', rule: '5개', ways: comb(6, 5) * comb(39, 1) - 6, prize: 1500000, fixed: false },
  { rank: 4, label: '4등', rule: '4개', ways: comb(6, 4) * comb(39, 2), prize: 50000, fixed: true },
  { rank: 5, label: '5등', rule: '3개', ways: comb(6, 3) * comb(39, 3), prize: 5000, fixed: true },
];
const ballColor = (n) => (n <= 10 ? 'y' : n <= 20 ? 'b' : n <= 30 ? 'r' : n <= 40 ? 'g' : 'gr');
const ballsHtml = (nums, bonus) =>
  `<div class="lt-balls">${nums.map((n) => `<span class="lt-ball ${ballColor(n)}">${n}</span>`).join('')}${bonus ? `<i>+</i><span class="lt-ball ${ballColor(bonus)}">${bonus}</span>` : ''}</div>`;
const fmtPct = (p) => {
  const v = p * 100;
  if (v >= 1) return v.toFixed(2) + '%';
  if (v >= 0.01) return v.toFixed(3) + '%';
  return v.toFixed(7).replace(/0+$/, '') + '%';
};
const fmtWon = (n) => (n >= 100000000 ? `${(n / 100000000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}억 원` : n >= 10000 ? `${Math.round(n / 10000).toLocaleString('ko-KR')}만 원` : `${n.toLocaleString('ko-KR')}원`);

function drawSet(include = [], exclude = []) {
  const pool = [...Array(45).keys()].map((i) => i + 1).filter((n) => !exclude.includes(n) && !include.includes(n));
  const picked = [...include];
  while (picked.length < 6 && pool.length) picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return picked.sort((a, b) => a - b);
}
const parseNums = (s) => [...new Set(String(s).split(/[^\d]+/).map(Number).filter((n) => n >= 1 && n <= 45))];

function setAnalysis(nums) {
  const sum = nums.reduce((a, b) => a + b, 0);
  const odd = nums.filter((n) => n % 2).length;
  const low = nums.filter((n) => n <= 22).length;
  let consec = 0;
  for (let i = 1; i < nums.length; i++) if (nums[i] === nums[i - 1] + 1) consec++;
  const notes = [];
  notes.push(`합계 ${sum} (모든 조합의 평균은 138이에요${sum >= 100 && sum <= 175 ? ', 흔한 범위' : sum < 100 ? ', 작은 숫자 위주' : ', 큰 숫자 위주'})`);
  notes.push(`홀수 ${odd} : 짝수 ${6 - odd}`);
  notes.push(`작은 수(1~22) ${low}개 · 큰 수(23~45) ${6 - low}개`);
  if (consec) notes.push(`연속 번호 ${consec}쌍`);
  return notes;
}

// 같은 번호로 매주 1게임씩 n회 샀다고 치고 실제로 추첨해 봄
function simulate(nums, weeks) {
  const mine = new Set(nums);
  const hits = [0, 0, 0, 0, 0, 0];
  const balls = [...Array(45).keys()].map((i) => i + 1);
  for (let w = 0; w < weeks; w++) {
    for (let i = 0; i < 7; i++) {
      const j = i + Math.floor(Math.random() * (45 - i));
      [balls[i], balls[j]] = [balls[j], balls[i]];
    }
    let m = 0;
    for (let i = 0; i < 6; i++) if (mine.has(balls[i])) m++;
    const bonus = mine.has(balls[6]);
    if (m === 6) hits[1]++;
    else if (m === 5 && bonus) hits[2]++;
    else if (m === 5) hits[3]++;
    else if (m === 4) hits[4]++;
    else if (m === 3) hits[5]++;
  }
  const won = LOTTO_RANKS.reduce((a, r) => a + hits[r.rank] * r.prize, 0);
  return { hits, spent: weeks * 1000, won };
}

function renderLotto() {
  document.title = '로또 번호 생성기 · 당첨 확률 분석 · 맞혀봐';
  const saved = gameStore.get('lotto') || { count: 5, include: '', exclude: '' };
  app.innerHTML = `${fortuneHead('로또 번호 생성기')}
    <form class="ft-form lt-form">
      <div class="opt-row" role="group" aria-label="게임 수">${[1, 3, 5].map((n) => `<button type="button" class="chip" data-count="${n}" aria-pressed="${saved.count === n}">${n}게임</button>`).join('')}</div>
      <div class="num-row lt-opts">
        <label class="field"><span>꼭 넣을 번호 (선택)</span><input name="include" inputmode="numeric" placeholder="예: 7, 17" value="${esc(saved.include)}"></label>
        <label class="field"><span>뺄 번호 (선택)</span><input name="exclude" inputmode="numeric" placeholder="예: 4, 44" value="${esc(saved.exclude)}"></label>
      </div>
      <button class="btn block">🎱 번호 뽑기</button>
    </form>
    <div class="lt-out"></div>
    <section class="lt-odds">
      <h2 class="ft-sub">실제 당첨 확률 (1게임 기준)</h2>
      <table class="lt-table"><thead><tr><th>등수</th><th>맞힐 개수</th><th>확률</th><th>몇 번에 한 번</th></tr></thead><tbody>
        ${LOTTO_RANKS.map((r) => `<tr><td><b>${r.label}</b></td><td>${r.rule}</td><td>${fmtPct(r.ways / LOTTO_TOTAL)}</td><td>${Math.round(LOTTO_TOTAL / r.ways).toLocaleString('ko-KR')}분의 1</td></tr>`).join('')}
        <tr class="sum"><td><b>뭐라도 당첨</b></td><td>3개 이상</td><td>${fmtPct(LOTTO_RANKS.reduce((a, r) => a + r.ways, 0) / LOTTO_TOTAL)}</td><td>${Math.round(LOTTO_TOTAL / LOTTO_RANKS.reduce((a, r) => a + r.ways, 0))}분의 1</td></tr>
      </tbody></table>
      <ul class="lt-facts">
        <li>전체 조합은 <b>45개 중 6개 = 8,145,060가지</b>예요. 1등은 그중 딱 하나라서 확률은 <b>0.0000123%</b>예요.</li>
        <li>매주 5게임(5천 원)씩 사도 1등이 한 번 나오려면 평균 <b>${Math.round(LOTTO_TOTAL / 5 / 52).toLocaleString('ko-KR')}년</b>이 걸려요.</li>
        <li><b>어떤 번호 조합이든 1등 확률은 똑같아요.</b> 1·2·3·4·5·6도, 생일 번호도 같아요. 다만 많은 사람이 고르는 번호(생일처럼 31 이하 위주)는 당첨돼도 나눠 가질 사람이 많아요.</li>
        <li>로또 판매액의 절반 정도만 당첨금으로 돌아와요. 1,000원을 사면 평균 500원쯤 돌려받는 셈이에요.</li>
      </ul>
      <p class="ft-note">로또는 만 19세 이상만 살 수 있어요. 이 생성기는 재미로만 써 주세요.</p>
    </section>
    ${LOTTO_ABOUT}
    ${SITE_FOOT}`;
  bindBack('/fortune/');
  let count = [1, 3, 5].includes(saved.count) ? saved.count : 5;
  const form = app.querySelector('form');
  const out = app.querySelector('.lt-out');
  app.querySelectorAll('[data-count]').forEach((b) =>
    b.addEventListener('click', () => {
      count = Number(b.dataset.count);
      app.querySelectorAll('[data-count]').forEach((x) => x.setAttribute('aria-pressed', x === b));
    })
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const include = parseNums(form.include.value).slice(0, 5);
    const exclude = parseNums(form.exclude.value).filter((n) => !include.includes(n)).slice(0, 30);
    gameStore.save('lotto', { count, include: form.include.value, exclude: form.exclude.value });
    const sets = Array.from({ length: count }, () => drawSet(include, exclude));
    sfx('ok');
    out.innerHTML = `
      ${sets.map((s, k) => `<div class="lt-set"><div class="lt-set-head"><b>${'ABCDE'[k]}</b>${ballsHtml(s)}</div><p>${setAnalysis(s).join(' · ')}</p><button class="btn ghost lt-sim" data-k="${k}">이 번호로 매주 샀다면? 🔁</button><div class="lt-sim-out"></div></div>`).join('')}
      <p class="ft-note">${count}게임을 사면 1등 확률은 ${count}/8,145,060 (${fmtPct(count / LOTTO_TOTAL)})로 늘어나요.</p>
      <div class="game-actions"><button class="btn ghost block" data-act="share">📣 번호 보내기</button><button class="btn ghost block" data-act="copy">📋 번호 복사</button></div>`;
    const text = sets.map((s, k) => `${'ABCDE'[k]}: ${s.join(', ')}`).join('\n');
    out.querySelector('[data-act="share"]').addEventListener('click', () => shareFortune(`🎱 맞혀봐가 뽑아 준 로또 번호\n${text}`, `${location.origin}/lotto/`));
    out.querySelector('[data-act="copy"]').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(text);
        toast('번호를 복사했어요');
      } catch {
        prompt('번호를 복사하세요', text);
      }
    });
    out.querySelectorAll('.lt-sim').forEach((btn) =>
      btn.addEventListener('click', () => {
        const nums = sets[Number(btn.dataset.k)];
        const box = btn.nextElementSibling;
        const years = 100;
        const r = simulate(nums, years * 52);
        box.innerHTML = `
          <p class="lt-sim-title">매주 1게임씩 <b>${years}년(${(years * 52).toLocaleString('ko-KR')}번)</b> 샀다고 치고 실제로 추첨해 봤어요</p>
          <div class="lt-sim-grid">${LOTTO_RANKS.map((x) => `<div><span>${x.label}</span><b>${r.hits[x.rank]}번</b></div>`).join('')}</div>
          <p>쓴 돈 <b>${fmtWon(r.spent)}</b> → 받은 돈 <b>${fmtWon(r.won)}</b> <span class="${r.won >= r.spent ? 'lt-plus' : 'lt-minus'}">(${r.won >= r.spent ? '+' : ''}${fmtWon(r.won - r.spent)})</span></p>
          <p class="ft-note">1~3등 금액은 회차마다 달라 평균 정도(1등 20억·2등 6천만·3등 150만 원)로 계산했어요. 누를 때마다 새로 추첨해요.</p>`;
      })
    );
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}
