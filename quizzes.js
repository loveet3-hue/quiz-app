// 퀴즈 데이터.
// 나중에 서버(직접 만들기 기능)로 옮겨도 이 모양 그대로 쓸 수 있게 맞춰 둠.
//
// 퀴즈 하나:
//   id        주소에 쓰이는 영문 이름 (#/q/flags)
//   title     제목
//   desc      한 줄 설명
//   category  카테고리 (목록 필터에 쓰임)
//   perPlay   한 판에 낼 문제 수 (문제가 더 많으면 무작위로 뽑음)
//   cover     목록 카드 표지 { image } (그림은 covers.js) 또는 { flags: [국가코드...], vs }
//   questions 문제 목록
//   exact     true면 오타를 봐주지 않음 (맞춤법 퀴즈)
//   guide     문제 아래에 보여줄 답 쓰는 방법 안내
//   generate  questions 대신 쓰는 함수. 풀 때마다 문제를 새로 만들어 냄 (암산 등)
//   appHidden true면 스토어 앱(안드로이드 등)으로 열었을 때 목록에서 숨김
//
// 문제 하나 (필요한 것만 쓰면 됨):
//   image     보여줄 사진 주소
//   big       크게 보여줄 글자
//   chosung   true면 정답의 초성을 자동으로 만들어 크게 보여줌
//   text      문제 문장
//   answer    정답
//   alias     같이 인정할 다른 답 목록
//   hint      힌트 (안 쓰면 정답의 초성, 영어 정답이면 첫 글자와 글자 수가 힌트로 나감)
//   numeric   true면 휴대폰에서 숫자 키패드가 뜸
//   ask       '정답은?' 대신 보여줄 질문 (글만 있는 문제)
//   credit    이 문제 사진의 출처 (퀴즈 전체 credit보다 우선)
//   by        작가 이름. 쓰면 힌트가 '작가 + 초성'으로 나감 (명화 퀴즈)
//
// 퀴즈에 credit을 쓰면 문제 아래에 사진 출처가 작게 표시됨.

// FLAG(), WM(), rand(), QUESTIONS 는 data/_init.js에 있음. 문제 목록은 data/<퀴즈id>.js에 따로 둠.

// 시계 그림을 코드로 직접 그림 (저작권 걱정 없음)
function clockSvg(h, m) {
  const hand = (deg, len, width, color) => {
    const r = ((deg - 90) * Math.PI) / 180;
    return `<line x1="100" y1="100" x2="${(100 + len * Math.cos(r)).toFixed(1)}" y2="${(100 + len * Math.sin(r)).toFixed(1)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round"/>`;
  };
  let marks = '';
  for (let i = 1; i <= 12; i++) {
    const r = ((i * 30 - 90) * Math.PI) / 180;
    marks += `<text x="${(100 + 66 * Math.cos(r)).toFixed(1)}" y="${(100 + 66 * Math.sin(r)).toFixed(1)}" font-size="17" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#1d1b26" font-family="Arial, sans-serif">${i}</text>`;
  }
  for (let i = 0; i < 60; i++) {
    const r = ((i * 6 - 90) * Math.PI) / 180;
    const inner = i % 5 === 0 ? 80 : 84;
    marks += `<line x1="${(100 + inner * Math.cos(r)).toFixed(1)}" y1="${(100 + inner * Math.sin(r)).toFixed(1)}" x2="${(100 + 88 * Math.cos(r)).toFixed(1)}" y2="${(100 + 88 * Math.sin(r)).toFixed(1)}" stroke="#8f8aa3" stroke-width="${i % 5 === 0 ? 2.5 : 1}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <circle cx="100" cy="100" r="92" fill="#fff" stroke="#1d1b26" stroke-width="5"/>
    ${marks}
    ${hand(((h % 12) + m / 60) * 30, 44, 7, '#1d1b26')}
    ${hand(m * 6, 70, 4.5, '#7c5cff')}
    <circle cx="100" cy="100" r="5" fill="#1d1b26"/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const QUIZZES = [
  {
    id: 'trivia-easy',
    title: '쉬운 상식 퀴즈 (초급)',
    desc: '누구나 맞힐 수 있는 쉬운 상식부터 가볍게!',
    category: '상식',
    perPlay: 10,
    cover: { image: COVERS['trivia-easy'] },
    questions: [],
  },
  {
    id: 'trivia',
    title: '일반 상식 퀴즈 (중급)',
    desc: '사회·문화·경제·스포츠, 알아 두면 쓸모 있는 상식',
    category: '상식',
    perPlay: 10,
    cover: { image: COVERS.trivia },
    questions: [],
  },
  {
    id: 'trivia-hard',
    title: '어려운 상식 퀴즈 (고급)',
    desc: '골든벨 마지막 문제급! 상식 고수만 도전하세요',
    category: '상식',
    perPlay: 10,
    cover: { image: COVERS['trivia-hard'] },
    questions: [],
  },
  {
    id: 'life-trivia',
    title: '생활·과학 상식 퀴즈',
    desc: '물은 몇 도에서 끓을까? 일상 속 과학 상식',
    category: '상식',
    perPlay: 10,
    cover: { image: COVERS['life-trivia'] },
    questions: [],
  },
  {
    id: 'flags',
    guide: '나라 이름을 써 보세요',
    title: '국기 보고 나라 맞히기',
    desc: '국기만 보고 어느 나라인지 맞혀 보세요',
    category: '지리',
    perPlay: 10,
    cover: { flags: ['kr', 'us', 'jp', 'br'] },
    questions: [
      { image: FLAG('kr'), answer: '대한민국', alias: ['한국', '남한'] },
      { image: FLAG('jp'), answer: '일본' },
      { image: FLAG('us'), answer: '미국', alias: ['미합중국'] },
      { image: FLAG('gb'), answer: '영국' },
      { image: FLAG('fr'), answer: '프랑스' },
      { image: FLAG('de'), answer: '독일' },
      { image: FLAG('br'), answer: '브라질' },
      { image: FLAG('ca'), answer: '캐나다' },
      { image: FLAG('it'), answer: '이탈리아', alias: ['이태리'] },
      { image: FLAG('in'), answer: '인도' },
      { image: FLAG('mx'), answer: '멕시코' },
      { image: FLAG('tr'), answer: '튀르키예', alias: ['터키'] },
      { image: FLAG('se'), answer: '스웨덴' },
      { image: FLAG('ch'), answer: '스위스' },
      { image: FLAG('ar'), answer: '아르헨티나' },
      { image: FLAG('gr'), answer: '그리스' },
      { image: FLAG('vn'), answer: '베트남' },
      { image: FLAG('za'), answer: '남아프리카공화국', alias: ['남아공', '남아프리카'] },
    ],
  },
  {
    id: 'idioms',
    title: '초성 보고 사자성어 맞히기',
    desc: '초성과 뜻풀이를 보고 네 글자를 채워 보세요',
    category: '언어',
    perPlay: 10,
    cover: { image: COVERS['idioms'] },
    questions: [
      { chosung: true, answer: '일석이조', text: '한 가지 일로 두 가지 이득을 봄' },
      { chosung: true, answer: '자업자득', text: '자기가 저지른 일의 결과를 자기가 받음' },
      { chosung: true, answer: '우왕좌왕', text: '이리저리 왔다 갔다 하며 갈피를 못 잡음' },
      { chosung: true, answer: '감언이설', text: '귀가 솔깃하도록 비위를 맞추는 달콤한 말' },
      { chosung: true, answer: '이구동성', text: '여러 사람의 말이 한결같음' },
      { chosung: true, answer: '대기만성', text: '큰 그릇은 늦게 이루어짐' },
      { chosung: true, answer: '새옹지마', text: '인생의 좋고 나쁜 일은 예측하기 어려움' },
      { chosung: true, answer: '유비무환', text: '미리 준비해 두면 걱정할 것이 없음' },
      { chosung: true, answer: '작심삼일', text: '굳게 먹은 마음이 사흘을 가지 못함' },
      { chosung: true, answer: '과유불급', text: '정도를 지나침은 미치지 못함과 같음' },
      { chosung: true, answer: '동문서답', text: '묻는 말에 전혀 엉뚱한 대답을 함' },
      { chosung: true, answer: '십중팔구', text: '열 가운데 여덟이나 아홉, 거의 대부분' },
      { chosung: true, answer: '전화위복', text: '나쁜 일이 오히려 좋은 일의 계기가 됨' },
      { chosung: true, answer: '역지사지', text: '처지를 바꾸어 생각해 봄' },
    ],
  },
  {
    id: 'capitals',
    title: '나라 이름 보고 수도 맞히기',
    desc: '헷갈리기 쉬운 수도만 모았어요',
    category: '지리',
    perPlay: 10,
    cover: { image: COVERS['capitals'] },
    questions: [
      { text: '호주의 수도는?', answer: '캔버라' },
      { text: '캐나다의 수도는?', answer: '오타와' },
      { text: '브라질의 수도는?', answer: '브라질리아' },
      { text: '튀르키예의 수도는?', answer: '앙카라' },
      { text: '스위스의 수도는?', answer: '베른' },
      { text: '베트남의 수도는?', answer: '하노이' },
      { text: '뉴질랜드의 수도는?', answer: '웰링턴' },
      { text: '미국의 수도는?', answer: '워싱턴 D.C.', alias: ['워싱턴', '워싱턴디씨', '워싱턴dc'] },
      { text: '이집트의 수도는?', answer: '카이로' },
      { text: '스페인의 수도는?', answer: '마드리드' },
      { text: '태국의 수도는?', answer: '방콕' },
      { text: '필리핀의 수도는?', answer: '마닐라' },
      { text: '포르투갈의 수도는?', answer: '리스본' },
      { text: '아르헨티나의 수도는?', answer: '부에노스아이레스' },
    ],
  },
  {
    id: 'nonsense',
    title: '넌센스 퀴즈',
    desc: '머리 말고 말장난으로 푸는 문제',
    category: '재미',
    perPlay: 10,
    cover: { image: COVERS['nonsense'] },
    questions: [
      { text: '세상에서 가장 뜨거운 과일은?', answer: '천도복숭아' },
      { text: '왕이 넘어지면?', answer: '킹콩' },
      { text: '소가 웃으면?', answer: '우하하', alias: ['우하하하'] },
      { text: '바나나가 웃으면?', answer: '바나나킥' },
      { text: '미소의 반대말은?', answer: '당기소' },
      { text: '오리가 얼면?', answer: '언덕' },
      { text: '세상에서 가장 쉬운 숫자는?', answer: '십구만', alias: ['190000', '19만'] },
      { text: '아몬드가 죽으면?', answer: '다이아몬드' },
      { text: '개가 사람을 가르치면?', answer: '개인지도' },
      { text: '자동차를 톡 치면?', answer: '카톡' },
      { text: '칼이 정색하면?', answer: '검정색', alias: ['검정'] },
      { text: '세상에서 제일 빠른 닭은?', answer: '후다닥' },
      { text: '딸기가 직장을 잃으면?', answer: '딸기시럽' },
      { text: '물고기의 반대말은?', answer: '불고기' },
      { text: '신발이 화나면?', answer: '신발끈' },
    ],
  },
  {
    id: 'foods',
    title: '초성 보고 음식 맞히기',
    desc: '설명을 보면 군침부터 돌아요',
    category: '음식',
    perPlay: 10,
    cover: { image: COVERS['foods'] },
    questions: [
      { chosung: true, answer: '떡볶이', text: '빨간 양념에 떡과 어묵을 볶은 분식' },
      { chosung: true, answer: '김치찌개', text: '김치와 돼지고기를 넣고 끓인 찌개' },
      { chosung: true, answer: '비빔밥', text: '밥에 나물과 고추장을 넣고 비벼 먹는 음식' },
      { chosung: true, answer: '삼겹살', text: '돼지 뱃살을 구워 먹는 고기' },
      { chosung: true, answer: '불고기', text: '간장 양념에 재운 소고기 구이' },
      { chosung: true, answer: '냉면', text: '차가운 육수에 메밀면을 말아 먹는 음식' },
      { chosung: true, answer: '김밥', text: '김에 밥과 재료를 넣고 돌돌 만 음식' },
      { chosung: true, answer: '잡채', text: '당면과 채소를 볶아 무친 잔치 음식' },
      { chosung: true, answer: '짜장면', alias: ['자장면'], text: '검은 춘장 소스에 비벼 먹는 중식 면' },
      { chosung: true, answer: '탕수육', text: '튀긴 고기에 새콤달콤한 소스를 곁들인 요리' },
      { chosung: true, answer: '순대', text: '돼지 창자에 당면 등을 채워 찐 음식' },
      { chosung: true, answer: '호떡', text: '반죽 속에 설탕과 견과를 넣고 구운 겨울 간식' },
      { chosung: true, answer: '팥빙수', text: '곱게 간 얼음 위에 팥을 올린 여름 디저트' },
      { chosung: true, answer: '감자탕', text: '돼지 등뼈와 감자를 넣고 얼큰하게 끓인 탕' },
      { chosung: true, answer: '갈비찜', text: '갈비를 간장 양념에 푹 쪄 낸 명절 음식' },
    ],
  },
  {
    id: 'proverbs',
    title: '속담 빈칸 채우기',
    desc: '빈칸에 들어갈 말을 써 보세요',
    category: '언어',
    perPlay: 10,
    cover: { image: COVERS['proverbs'] },
    questions: [
      { text: '가는 말이 고와야 ＿＿ 말이 곱다', answer: '오는' },
      { text: '낮말은 새가 듣고 밤말은 ＿가 듣는다', answer: '쥐' },
      { text: '원숭이도 ＿＿에서 떨어진다', answer: '나무' },
      { text: '소 잃고 ＿＿＿ 고친다', answer: '외양간' },
      { text: '세 살 버릇 ＿＿까지 간다', answer: '여든' },
      { text: '백지장도 ＿＿면 낫다', answer: '맞들' },
      { text: '하늘이 무너져도 솟아날 ＿＿이 있다', answer: '구멍' },
      { text: '고래 싸움에 ＿＿ 등 터진다', answer: '새우' },
      { text: '등잔 밑이 ＿＿＿', answer: '어둡다' },
      { text: '발 없는 말이 ＿＿ 간다', answer: '천리', alias: ['천 리'] },
      { text: '티끌 모아 ＿＿', answer: '태산' },
      { text: '우물 안 ＿＿＿', answer: '개구리' },
      { text: '빈 수레가 ＿＿＿＿', answer: '요란하다' },
      { text: '될성부른 나무는 ＿＿부터 알아본다', answer: '떡잎' },
      { text: '열 번 찍어 안 넘어가는 ＿＿ 없다', answer: '나무' },
    ],
  },
  {
    id: 'english',
    guide: '영어 단어로 써 보세요 · 대소문자는 상관없어요',
    title: '우리말 보고 영어 단어 쓰기',
    desc: '철자까지 정확하게 써 보세요',
    category: '언어',
    perPlay: 10,
    cover: { image: COVERS['english'] },
    questions: [
      { big: '사과', text: '영어로 쓰면?', answer: 'apple' },
      { big: '학교', text: '영어로 쓰면?', answer: 'school' },
      { big: '친구', text: '영어로 쓰면?', answer: 'friend' },
      { big: '도서관', text: '영어로 쓰면?', answer: 'library' },
      { big: '나비', text: '영어로 쓰면?', answer: 'butterfly' },
      { big: '우산', text: '영어로 쓰면?', answer: 'umbrella' },
      { big: '생일', text: '영어로 쓰면?', answer: 'birthday' },
      { big: '부엌', text: '영어로 쓰면?', answer: 'kitchen' },
      { big: '날씨', text: '영어로 쓰면?', answer: 'weather' },
      { big: '병원', text: '영어로 쓰면?', answer: 'hospital' },
      { big: '코끼리', text: '영어로 쓰면?', answer: 'elephant' },
      { big: '연필', text: '영어로 쓰면?', answer: 'pencil' },
      { big: '비행기', text: '영어로 쓰면?', answer: 'airplane', alias: ['plane', 'aeroplane'] },
      { big: '거북이', text: '영어로 쓰면?', answer: 'turtle', alias: ['tortoise'] },
      { big: '아침 식사', text: '영어로 쓰면?', answer: 'breakfast' },
    ],
  },
  {
    id: 'mental-math',
    guide: '숫자만 써 보세요',
    title: '10초 암산',
    desc: '풀 때마다 새 문제가 나와요',
    category: '수학',
    perPlay: 10,
    cover: { image: COVERS['mental-math'] },
    generate(count) {
      const make = () => {
        const kind = rand(0, 2);
        let a, b, op, ans;
        if (kind === 0) { a = rand(12, 89); b = rand(12, 89); op = '+'; ans = a + b; }
        else if (kind === 1) { a = rand(30, 99); b = rand(11, a - 1); op = '−'; ans = a - b; }
        else { a = rand(12, 39); b = rand(3, 9); op = '×'; ans = a * b; }
        return { big: `${a} ${op} ${b}`, answer: String(ans), numeric: true, hint: `일의 자리 숫자는 ${ans % 10}` };
      };
      return Array.from({ length: count }, make);
    },
  },
  {
    id: 'elements',
    guide: '원소 이름을 한글로 써 보세요 (예: 철, 산소)',
    title: '원소 기호 보고 이름 맞히기',
    desc: '과학 시간에 외웠던 그 기호들',
    category: '과학',
    perPlay: 10,
    cover: { image: COVERS['elements'] },
    questions: [
      { big: 'H', text: '이 원소의 이름은?', answer: '수소' },
      { big: 'He', text: '이 원소의 이름은?', answer: '헬륨' },
      { big: 'C', text: '이 원소의 이름은?', answer: '탄소' },
      { big: 'N', text: '이 원소의 이름은?', answer: '질소' },
      { big: 'O', text: '이 원소의 이름은?', answer: '산소' },
      { big: 'Na', text: '이 원소의 이름은?', answer: '나트륨', alias: ['소듐'] },
      { big: 'Fe', text: '이 원소의 이름은?', answer: '철' },
      { big: 'Au', text: '이 원소의 이름은?', answer: '금' },
      { big: 'Ag', text: '이 원소의 이름은?', answer: '은' },
      { big: 'Cu', text: '이 원소의 이름은?', answer: '구리' },
      { big: 'Ca', text: '이 원소의 이름은?', answer: '칼슘' },
      { big: 'Cl', text: '이 원소의 이름은?', answer: '염소' },
      { big: 'K', text: '이 원소의 이름은?', answer: '칼륨', alias: ['포타슘'] },
      { big: 'Mg', text: '이 원소의 이름은?', answer: '마그네슘' },
      { big: 'S', text: '이 원소의 이름은?', answer: '황' },
      { big: 'Zn', text: '이 원소의 이름은?', answer: '아연' },
    ],
  },
  {
    id: 'history',
    title: '설명 보고 역사 인물 맞히기',
    desc: '교과서에서 만난 우리 역사 속 인물',
    category: '역사',
    perPlay: 10,
    cover: { image: COVERS['history'] },
    questions: [
      { text: '훈민정음을 만든 조선의 왕은?', answer: '세종대왕', alias: ['세종'] },
      { text: '거북선을 이끌고 임진왜란에서 활약한 장군은?', answer: '이순신' },
      { text: '고구려를 세운 왕은?', answer: '주몽', alias: ['동명성왕'] },
      { text: '신라의 삼국 통일을 이끈 장군은?', answer: '김유신' },
      { text: '측우기와 자격루를 만든 조선의 과학자는?', answer: '장영실' },
      { text: '3·1 운동 때 아우내 장터에서 만세 운동을 이끈 학생은?', answer: '유관순' },
      { text: '조선을 세운 왕은?', answer: '이성계', alias: ['태조', '태조이성계'] },
      { text: '하얼빈에서 이토 히로부미를 저격한 독립운동가는?', answer: '안중근' },
      { text: '대한민국 임시정부 주석을 지낸 독립운동가는?', answer: '김구', alias: ['백범김구'] },
      { text: '고려를 세운 왕은?', answer: '왕건', alias: ['태조왕건'] },
      { text: '거중기를 설계해 수원 화성 축조에 기여한 실학자는?', answer: '정약용', alias: ['다산'] },
      { text: '발해를 세운 인물은?', answer: '대조영' },
      { text: '평양으로 도읍을 옮긴 광개토대왕의 아들은?', answer: '장수왕' },
      { text: '"동의보감"을 쓴 조선의 의관은?', answer: '허준' },
      { text: '임진왜란 때 행주대첩을 승리로 이끈 장군은?', answer: '권율' },
    ],
  },
  {
    id: 'cities',
    title: '초성 보고 우리나라 도시 맞히기',
    desc: '명소와 먹거리로 떠올려 보세요',
    category: '지리',
    perPlay: 10,
    cover: { image: COVERS['cities'] },
    questions: [
      { chosung: true, answer: '부산', text: '해운대와 광안리가 있는 항구 도시' },
      { chosung: true, answer: '대구', text: '사과와 무더위로 유명한 경상도의 광역시' },
      { chosung: true, answer: '광주', text: '무등산이 있는 전라도의 광역시' },
      { chosung: true, answer: '대전', text: '엑스포와 유명 빵집으로 알려진 중부의 광역시' },
      { chosung: true, answer: '인천', text: '국제공항과 차이나타운이 있는 항구 도시' },
      { chosung: true, answer: '울산', text: '자동차·조선 공장이 모인 공업 도시' },
      { chosung: true, answer: '제주', alias: ['제주도'], text: '한라산과 돌하르방의 섬' },
      { chosung: true, answer: '전주', text: '비빔밥과 한옥마을로 유명한 도시' },
      { chosung: true, answer: '경주', text: '불국사와 첨성대가 있는 신라의 옛 수도' },
      { chosung: true, answer: '강릉', text: '경포대와 커피 거리로 유명한 동해안 도시' },
      { chosung: true, answer: '춘천', text: '닭갈비와 호수로 유명한 강원도 도시' },
      { chosung: true, answer: '수원', text: '화성과 갈비로 유명한 경기도 도시' },
      { chosung: true, answer: '여수', text: '밤바다로 유명한 남해안 도시' },
      { chosung: true, answer: '안동', text: '하회마을과 찜닭의 도시' },
      { chosung: true, answer: '속초', text: '설악산 아래 동해안 항구 도시' },
    ],
  },
  {
    id: 'paintings',
    guide: '작품 제목을 써 보세요 · 작가 이름은 힌트에 있어요',
    title: '명화 보고 제목 맞히기',
    desc: '한 번쯤 본 그 그림, 제목은 뭘까요?',
    category: '예술',
    perPlay: 10,
    credit: '그림 출처: 위키미디어 공용 (퍼블릭 도메인)',
    cover: { image: WM('Van Gogh - Starry Night - Google Art Project.jpg') },
    questions: [
      { image: WM('Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg'), answer: '모나리자', alias: ['라 조콘다'], by: '레오나르도 다빈치' },
      { image: WM('Van Gogh - Starry Night - Google Art Project.jpg'), answer: '별이 빛나는 밤', alias: ['별이 빛나는 밤에'], by: '빈센트 반 고흐' },
      { image: WM('1665 Girl with a Pearl Earring.jpg'), answer: '진주 귀고리를 한 소녀', alias: ['진주 귀걸이를 한 소녀', '진주 귀고리 소녀', '진주 귀걸이 소녀'], by: '요하네스 페르메이르' },
      { image: WM('Edvard Munch, 1893, The Scream, oil, tempera and pastel on cardboard, 91 x 73 cm, National Gallery of Norway.jpg'), answer: '절규', alias: ['비명'], by: '에드바르 뭉크' },
      { image: WM('Sandro Botticelli - La nascita di Venere - Google Art Project - edited.jpg'), answer: '비너스의 탄생', by: '산드로 보티첼리' },
      { image: WM('The Last Supper - Leonardo Da Vinci - High Resolution 32x16.jpg'), answer: '최후의 만찬', by: '레오나르도 다빈치' },
      { image: WM('Tsunami by hokusai 19th century.jpg'), answer: '가나가와 해변의 높은 파도 아래', alias: ['가나가와 해변의 높은 파도', '가나가와의 큰 파도', '가나가와 해변의 큰 파도', '큰 파도'], by: '가쓰시카 호쿠사이' },
      { image: WM('Vincent Willem van Gogh 127.jpg'), answer: '해바라기', by: '빈센트 반 고흐' },
      { image: WM('The Kiss - Gustav Klimt - Google Cultural Institute.jpg'), answer: '키스', alias: ['입맞춤'], by: '구스타프 클림트' },
      { image: WM('Monet - Impression, Sunrise.jpg'), answer: '인상, 해돋이', alias: ['해돋이', '인상 해돋이'], by: '클로드 모네' },
      { image: WM('Jean-François Millet - Gleaners - Google Art Project 2.jpg'), answer: '이삭 줍는 여인들', alias: ['이삭줍기', '이삭 줍는 사람들'], by: '장 프랑수아 밀레' },
      { image: WM('Jean-François Millet - The Angelus - Google Art Project.jpg'), answer: '만종', alias: ['삼종기도'], by: '장 프랑수아 밀레' },
      { image: WM('Michelangelo - Creation of Adam (cropped).jpg'), answer: '아담의 창조', alias: ['천지창조'], by: '미켈란젤로' },
      { image: WM('Eugène Delacroix - Le 28 Juillet. La Liberté guidant le peuple.jpg'), answer: '민중을 이끄는 자유의 여신', alias: ['민중을 이끄는 자유', '자유의 여신'], by: '외젠 들라크루아' },
      { image: WM('A Sunday on La Grande Jatte, Georges Seurat, 1884.jpg'), answer: '그랑드 자트 섬의 일요일 오후', alias: ['그랑드자트섬의 일요일 오후'], by: '조르주 쇠라' },
      { image: WM('Vincent Willem van Gogh - Cafe Terrace at Night (Yorck).jpg'), answer: '밤의 카페 테라스', alias: ['카페 테라스'], by: '빈센트 반 고흐' },
      { image: WM('Bridge over a Pond of Water Lilies MET DT1854.jpg'), answer: '수련 연못 위의 다리', alias: ['수련', '수련 연못', '일본식 다리'], by: '클로드 모네' },
      { image: WM('Danwon Ssireum.jpg'), answer: '씨름', by: '김홍도' },
      { image: WM('Inwangjesaekdo.jpg'), answer: '인왕제색도', by: '정선' },
    ],
  },
  {
    id: 'space',
    title: '우주 사진 보고 천체 맞히기',
    desc: 'NASA가 찍은 진짜 사진이에요',
    category: '과학',
    perPlay: 10,
    credit: '사진 출처: NASA · 위키미디어 공용 (퍼블릭 도메인)',
    cover: { image: WM('Saturn during Equinox.jpg') },
    questions: [
      { image: WM('Mercury in true color.jpg'), text: '이 천체의 이름은?', answer: '수성' },
      { image: WM('Venus-real color.jpg'), text: '이 천체의 이름은?', answer: '금성' },
      { image: WM('The Earth seen from Apollo 17.jpg'), text: '이 천체의 이름은?', answer: '지구' },
      { image: WM('Mars atmosphere by Hubble.jpg'), text: '이 천체의 이름은?', answer: '화성' },
      { image: WM('Jupiter and its shrunken Great Red Spot.jpg'), text: '이 천체의 이름은?', answer: '목성' },
      { image: WM('Saturn during Equinox.jpg'), text: '이 천체의 이름은?', answer: '토성' },
      { image: WM('Uranus2.jpg'), text: '이 천체의 이름은?', answer: '천왕성' },
      { image: WM('Neptune Full.jpg'), text: '이 천체의 이름은?', answer: '해왕성' },
      { image: WM("The Sun by the Atmospheric Imaging Assembly of NASA's Solar Dynamics Observatory - 20100819.jpg"), text: '이 천체의 이름은?', answer: '태양', alias: ['해'] },
      { image: WM('Moon nearside LRO 5000.jpg'), text: '이 천체의 이름은?', answer: '달' },
      { image: WM('Pluto in True Color - High-Res.jpg'), text: '이 천체의 이름은?', answer: '명왕성' },
    ],
  },
  {
    id: 'flags-hard',
    guide: '나라 이름을 써 보세요',
    title: '어려운 국기 맞히기',
    desc: '덜 알려진 나라와 닮은꼴 국기. 국기 1탄을 깼다면 도전!',
    category: '지리',
    perPlay: 10,
    cover: { flags: ['ro', 'td'], vs: true },
    questions: [
      { image: FLAG('id'), answer: '인도네시아' },
      { image: FLAG('mc'), answer: '모나코' },
      { image: FLAG('ro'), answer: '루마니아' },
      { image: FLAG('td'), answer: '차드' },
      { image: FLAG('ie'), answer: '아일랜드' },
      { image: FLAG('ci'), answer: '코트디부아르', alias: ['아이보리코스트'] },
      { image: FLAG('no'), answer: '노르웨이' },
      { image: FLAG('is'), answer: '아이슬란드' },
      { image: FLAG('fi'), answer: '핀란드' },
      { image: FLAG('dk'), answer: '덴마크' },
      { image: FLAG('nl'), answer: '네덜란드' },
      { image: FLAG('lu'), answer: '룩셈부르크' },
      { image: FLAG('ru'), answer: '러시아' },
      { image: FLAG('au'), answer: '호주', alias: ['오스트레일리아'] },
      { image: FLAG('nz'), answer: '뉴질랜드' },
      { image: FLAG('pl'), answer: '폴란드' },
      { image: FLAG('at'), answer: '오스트리아' },
      { image: FLAG('be'), answer: '벨기에' },
      { image: FLAG('co'), answer: '콜롬비아' },
      { image: FLAG('ec'), answer: '에콰도르' },
    ],
  },
  {
    id: 'animals',
    title: '사진 보고 동물 맞히기',
    desc: '동물원에서 본 그 동물, 이름이 뭐였더라?',
    category: '동물',
    perPlay: 10,
    cover: { image: WM('Meerkat (Suricata suricatta) Tswalu.jpg') },
    questions: [
      { image: WM("020 The lion king Snyggve in the Serengeti National Park Photo by Giles Laurent.jpg"), text: '이 동물의 이름은?', answer: '사자', credit: "사진: Giles Laurent · CC BY-SA 4.0" },
      { image: WM("Bengal tiger (Panthera tigris tigris) female 3 crop.jpg"), text: '이 동물의 이름은?', answer: '호랑이', alias: ["범"], credit: "사진: Charles J. Sharp · CC BY-SA 4.0" },
      { image: WM("178 Male African bush elephant in Etosha National Park Photo by Giles Laurent.jpg"), text: '이 동물의 이름은?', answer: '코끼리', credit: "사진: Giles Laurent · CC BY-SA 4.0" },
      { image: WM("Equus quagga burchellii - Etosha, 2014.jpg"), text: '이 동물의 이름은?', answer: '얼룩말', credit: "사진: Yathin S Krishnappa · CC BY-SA 3.0" },
      { image: WM("Grosser Panda.JPG"), text: '이 동물의 이름은?', answer: '판다', alias: ["자이언트판다", "대왕판다"], credit: "사진: J. Patrick Fischer · CC BY-SA 3.0" },
      { image: WM("Aptenodytes forsteri -Snow Hill Island, Antarctica -adults and juvenile-8.jpg"), text: '이 동물의 이름은?', answer: '펭귄', alias: ["황제펭귄"], credit: "사진: Ian Duffy from UK · CC BY 2.0" },
      { image: WM("Koala climbing tree.jpg"), text: '이 동물의 이름은?', answer: '코알라', credit: "사진: Diliff · CC BY-SA 3.0" },
      { image: WM("Portrait Hippopotamus in the water.jpg"), text: '이 동물의 이름은?', answer: '하마', credit: "사진: Muhammad Mahdi Karim · CC BY-SA 4.0" },
      { image: WM("Polar Bear - Alaska (cropped).jpg"), text: '이 동물의 이름은?', answer: '북극곰', alias: ["흰곰"], credit: "사진: Alan Wilson · CC BY-SA 3.0" },
      { image: WM("Camelus dromedarius in Nuweiba.jpg"), text: '이 동물의 이름은?', answer: '낙타', credit: "사진: Florian Prischl · CC BY-SA 3.0" },
      { image: WM("Male gorilla in SF zoo.jpg"), text: '이 동물의 이름은?', answer: '고릴라', credit: "사진: Brocken Inaglory · CC BY-SA 3.0" },
      { image: WM("American Flamingo JG.jpg"), text: '이 동물의 이름은?', answer: '홍학', alias: ["플라밍고"], credit: "사진: JeffreyGammon · CC BY 4.0" },
      { image: WM("Sea Otter (Enhydra lutris) (25169790524) crop.jpg"), text: '이 동물의 이름은?', answer: '해달', alias: ["수달"], credit: "사진: Marshal Hedin from San Diego · CC BY-SA 2.0" },
      { image: WM("Meerkat (Suricata suricatta) Tswalu.jpg"), text: '이 동물의 이름은?', answer: '미어캣', credit: "사진: Charles J. Sharp · CC BY-SA 4.0" },
      { image: WM("Male cheetah facing left in South Africa.jpg"), text: '이 동물의 이름은?', answer: '치타', credit: "사진: AfricanConservation · CC BY-SA 4.0" },
      { image: WM("Erinaceus europaeus LC0119.jpg"), text: '이 동물의 이름은?', answer: '고슴도치', credit: "사진: Jörg Hempel · CC BY-SA 2.0 de" },
      { image: WM("Peacock on tree (52077240794).jpg"), text: '이 동물의 이름은?', answer: '공작', alias: ["공작새"], credit: "사진: Kandukuru Nagarjun from Bangalore, India · CC BY 2.0" },
    ],
  },
  {
    id: 'landmarks',
    title: '사진 보고 세계 명소 맞히기',
    desc: '여행 가고 싶어지는 그곳',
    category: '지리',
    perPlay: 10,
    cover: { image: WM('Pyramids of the Giza Necropolis.jpg') },
    questions: [
      { image: WM("Tour Eiffel Wikimedia Commons (cropped).jpg"), text: '이곳의 이름은?', answer: '에펠탑', credit: "사진: Benh LIEU SONG · Public domain" },
      { image: WM("Front view of Statue of Liberty (cropped).jpg"), text: '이곳의 이름은?', answer: '자유의 여신상', credit: "사진: AskALotl · CC0" },
      { image: WM("Pyramids of the Giza Necropolis.jpg"), text: '이곳의 이름은?', answer: '피라미드', alias: ["기자 피라미드", "기자의 피라미드"], credit: "사진: KennyOMG · CC BY-SA 4.0" },
      { image: WM("Colosseo 2020.jpg"), text: '이곳의 이름은?', answer: '콜로세움', alias: ["콜로세오"], credit: "사진: FeaturedPics · CC BY-SA 4.0" },
      { image: WM("Taj Mahal (Edited).jpeg"), text: '이곳의 이름은?', answer: '타지마할', credit: "사진: Yann; edited by Jim Carter · CC BY-SA 4.0" },
      { image: WM("The Great Wall of China at Jinshanling-edit.jpg"), text: '이곳의 이름은?', answer: '만리장성', credit: "사진: Severin.stalder · CC BY-SA 3.0" },
      { image: WM("Italy - Pisa - Leaning Tower.jpg"), text: '이곳의 이름은?', answer: '피사의 사탑', alias: ["피사의 탑", "피사 사탑"], credit: "사진: Arne Müseler · CC BY-SA 3.0 de" },
      { image: WM("Sydney Australia. (21339175489).jpg"), text: '이곳의 이름은?', answer: '시드니 오페라 하우스', alias: ["오페라 하우스"], credit: "사진: Bernard Spragg. NZ from Christchurch, New Zealand · CC0" },
      { image: WM("Elizabeth Tower and the north front of the Palace of Westminster, London.jpg"), text: '이곳의 이름은?', answer: '빅벤', alias: ["엘리자베스 타워"], credit: "사진: Christian David · CC BY-SA 4.0" },
      { image: WM("Machu Picchu, 2023 (012).jpg"), text: '이곳의 이름은?', answer: '마추픽추', credit: "사진: Draceane · CC BY-SA 4.0" },
      { image: WM("Angkor Wat.jpg"), text: '이곳의 이름은?', answer: '앙코르와트', credit: "사진: Bjørn Christian Tørrissen · CC BY-SA 4.0" },
      { image: WM("AhuTongariki.JPG"), text: '이곳의 이름은?', answer: '모아이', alias: ["모아이 석상"], credit: "사진: Ian Sewell · CC BY 2.5" },
      { image: WM("Golden Gate Bridge as seen from Battery East.jpg"), text: '이곳의 이름은?', answer: '금문교', alias: ["골든게이트교", "골든 게이트 브리지"], credit: "사진: Frank Schulenburg · CC BY-SA 4.0" },
      { image: WM("Stonehenge2007 07 30.jpg"), text: '이곳의 이름은?', answer: '스톤헨지', credit: "사진: garethwiscombe · CC BY 2.0" },
      { image: WM("The Parthenon in Athens.jpg"), text: '이곳의 이름은?', answer: '파르테논 신전', alias: ["파르테논"], credit: "사진: Steve Swayne · CC BY 2.0" },
      { image: WM("Sungnyemun Gate, front, 2013.jpg"), text: '이곳의 이름은?', answer: '숭례문', alias: ["남대문"], credit: "사진: DoulosCore · CC BY-SA 3.0" },
      { image: WM("Cheomseongdae Observatory under blue sky in Gyeongju South Korea.jpg"), text: '이곳의 이름은?', answer: '첨성대', credit: "사진: Basile Morin · CC BY-SA 4.0" },
      { image: WM("Lotus Flower Bridge and Seven Treasure Bridge at Bulguksa in Gyeongju, Korea.jpg"), text: '이곳의 이름은?', answer: '불국사', credit: "사진: 작자 미상 · Public domain" },
      { image: WM("Saint Basil's Cathedral in Moscow.jpg"), text: '이곳의 이름은?', answer: '성 바실리 대성당', alias: ["성 바실리 성당", "바실리 성당"], credit: "사진: Tsy1980 · CC BY-SA 4.0" },
    ],
  },
  {
    id: 'spelling',
    title: '맞춤법 퀴즈',
    desc: '둘 중 맞는 표기를 그대로 써 보세요',
    category: '언어',
    perPlay: 10,
    exact: true, // 오타 인정 없음 (틀린 표기가 정답 처리되지 않게)
    cover: { image: COVERS['spelling'] },
    questions: [
      { text: '금새 / 금세', ask: '맞는 표기는?', answer: '금세', hint: "'금시에'가 줄어든 말이에요" },
      { text: '며칠 / 몇일', ask: '맞는 표기는?', answer: '며칠', hint: "'몇 일'로 쓰는 경우는 없어요" },
      { text: '어의없다 / 어이없다', ask: '맞는 표기는?', answer: '어이없다', hint: "'어의'는 임금의 의사예요" },
      { text: '왠지 / 웬지', ask: '맞는 표기는?', answer: '왠지', hint: "'왜인지'가 줄어든 말이에요" },
      { text: '설겆이 / 설거지', ask: '맞는 표기는?', answer: '설거지', hint: '소리 나는 대로 써요' },
      { text: '희한하다 / 희안하다', ask: '맞는 표기는?', answer: '희한하다', hint: "드물 희(稀), 드물 한(罕)" },
      { text: '오랫만에 / 오랜만에', ask: '맞는 표기는?', answer: '오랜만에', hint: "'오래간만에'가 줄어든 말이에요" },
      { text: '일일이 / 일일히', ask: '맞는 표기는?', answer: '일일이', hint: "'하나하나'라는 뜻이에요" },
      { text: '구지 / 굳이', ask: '맞는 표기는?', answer: '굳이', hint: "'굳다'에서 온 말이에요" },
      { text: '역할 / 역활', ask: '맞는 표기는?', answer: '역할', hint: "부릴 역(役), 나눌 할(割)" },
      { text: '내일 봬요 / 내일 뵈요', ask: '맞는 표기는?', answer: '내일 봬요', alias: ['봬요'], hint: "'뵈어요'가 줄어든 말이에요" },
      { text: '할께요 / 할게요', ask: '맞는 표기는?', answer: '할게요', hint: '된소리로 나도 예사소리로 써요' },
      { text: '내로라하는 / 내노라하는', ask: '맞는 표기는?', answer: '내로라하는', hint: "'나+이로라'에서 온 말이에요" },
      { text: '깨끗히 / 깨끗이', ask: '맞는 표기는?', answer: '깨끗이', hint: "'ㅅ' 받침 뒤에는 '-이'를 써요" },
      { text: '육개장 / 육계장', ask: '맞는 표기는?', answer: '육개장', hint: '닭(계)이 아니라 소고기(육)로 끓인 개장국이에요' },
      { text: '무난하다 / 문안하다', ask: "'별 어려움이 없다'는 뜻의 맞는 표기는?", answer: '무난하다', hint: '없을 무(無), 어려울 난(難)' },
    ],
  },
  {
    id: 'antonyms',
    title: '반대말 맞히기',
    desc: '보자마자 반대말이 떠오르나요?',
    category: '언어',
    perPlay: 10,
    cover: { image: COVERS['antonyms'] },
    questions: [
      { big: '뜨겁다', text: '반대말은?', answer: '차갑다' },
      { big: '길다', text: '반대말은?', answer: '짧다' },
      { big: '무겁다', text: '반대말은?', answer: '가볍다' },
      { big: '넓다', text: '반대말은?', answer: '좁다' },
      { big: '밝다', text: '반대말은?', answer: '어둡다' },
      { big: '높다', text: '반대말은?', answer: '낮다' },
      { big: '깊다', text: '반대말은?', answer: '얕다' },
      { big: '쉽다', text: '반대말은?', answer: '어렵다' },
      { big: '빠르다', text: '반대말은?', answer: '느리다' },
      { big: '이기다', text: '반대말은?', answer: '지다' },
      { big: '입구', text: '반대말은?', answer: '출구' },
      { big: '찬성', text: '반대말은?', answer: '반대' },
      { big: '성공', text: '반대말은?', answer: '실패' },
      { big: '공격', text: '반대말은?', answer: '수비', alias: ['방어'] },
      { big: '부지런하다', text: '반대말은?', answer: '게으르다' },
      { big: '두껍다', text: '반대말은?', answer: '얇다' },
    ],
  },
  {
    id: 'baby-animals',
    title: '동물 새끼 이름 맞히기',
    desc: '올챙이부터 능소니까지',
    category: '동물',
    perPlay: 10,
    cover: { image: COVERS['baby-animals'] },
    questions: [
      { text: '개구리의 새끼는?', answer: '올챙이' },
      { text: '닭의 새끼는?', answer: '병아리' },
      { text: '개의 새끼는?', answer: '강아지' },
      { text: '소의 새끼는?', answer: '송아지' },
      { text: '말의 새끼는?', answer: '망아지' },
      { text: '모기의 애벌레는?', answer: '장구벌레' },
      { text: '매미의 애벌레는?', answer: '굼벵이' },
      { text: '명태의 새끼는?', answer: '노가리' },
      { text: '고등어의 새끼는?', answer: '고도리' },
      { text: '곰의 새끼는?', answer: '능소니' },
      { text: '호랑이의 새끼는?', answer: '개호주' },
      { text: '꿩의 새끼는?', answer: '꺼병이' },
      { text: '잠자리의 애벌레는?', answer: '학배기' },
    ],
  },
  {
    id: 'slang',
    title: '줄임말 원래 말 맞히기',
    desc: '별걸 다 줄이는 요즘 말, 풀어서 써 보세요',
    category: '재미',
    perPlay: 10,
    cover: { image: COVERS['slang'] },
    questions: [
      { big: '소확행', text: '원래 말은?', answer: '소소하지만 확실한 행복' },
      { big: '워라밸', text: '원래 말은?', answer: '워크 라이프 밸런스', alias: ['일과 삶의 균형'] },
      { big: '갑분싸', text: '원래 말은?', answer: '갑자기 분위기 싸해짐', alias: ['갑자기 분위기가 싸해짐', '갑자기 분위기 싸해진다'] },
      { big: '얼죽아', text: '원래 말은?', answer: '얼어 죽어도 아이스 아메리카노' },
      { big: '케바케', text: '원래 말은?', answer: '케이스 바이 케이스' },
      { big: '엄친아', text: '원래 말은?', answer: '엄마 친구 아들' },
      { big: '내로남불', text: '원래 말은?', answer: '내가 하면 로맨스 남이 하면 불륜' },
      { big: '만반잘부', text: '원래 말은?', answer: '만나서 반가워 잘 부탁해' },
      { big: '스불재', text: '원래 말은?', answer: '스스로 불러온 재앙' },
      { big: '점메추', text: '원래 말은?', answer: '점심 메뉴 추천' },
      { big: '알잘딱깔센', text: '원래 말은?', answer: '알아서 잘 딱 깔끔하고 센스 있게' },
      { big: '가성비', text: '원래 말은?', answer: '가격 대비 성능', alias: ['가격 대비 성능비'] },
      { big: '버카충', text: '원래 말은?', answer: '버스 카드 충전' },
      { big: '별다줄', text: '원래 말은?', answer: '별걸 다 줄인다', alias: ['별것을 다 줄인다'] },
      { big: '할말하않', text: '원래 말은?', answer: '할 말은 많지만 하지 않겠다', alias: ['할 말은 많지만 하지 않겠어'] },
    ],
  },
  {
    id: 'sequence',
    guide: '숫자만 써 보세요',
    title: '규칙 찾아 빈칸 채우기',
    desc: '풀 때마다 새 수열! 숨은 규칙을 찾아보세요',
    category: '수학',
    perPlay: 10,
    cover: { image: COVERS['sequence'] },
    // 풀 때마다 규칙을 무작위로 골라 새 수열을 만든다
    generate(count) {
      const pick = (arr) => arr[rand(0, arr.length - 1)];
      const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71];
      const makers = [
        () => { const a = rand(1, 30), d = rand(2, 12), n = rand(4, 5); const xs = Array.from({ length: n + 1 }, (_, i) => a + d * i); return [xs, `${d}씩 커져요`]; },
        () => { const d = rand(3, 15), n = rand(4, 5), a = d * n + rand(5, 60); const xs = Array.from({ length: n + 1 }, (_, i) => a - d * i); return [xs, `${d}씩 작아져요`]; },
        () => { const r = pick([2, 3]), a = rand(1, 5), n = r === 2 ? 5 : 4; const xs = Array.from({ length: n + 1 }, (_, i) => a * r ** i); return [xs, `앞의 수의 ${r}배예요`]; },
        () => { const s = rand(1, 6), n = 5; const xs = Array.from({ length: n + 1 }, (_, i) => (s + i) ** 2); return [xs, '같은 수를 두 번 곱한 수예요 (1×1, 2×2 …)']; },
        () => { const s = rand(1, 3); const xs = Array.from({ length: 5 }, (_, i) => (s + i) ** 3); return [xs, '같은 수를 세 번 곱한 수예요 (1×1×1, 2×2×2 …)']; },
        () => { let a = rand(1, 4), b = a + rand(0, 4); const xs = [a, b]; while (xs.length < 7) xs.push(xs[xs.length - 1] + xs[xs.length - 2]); return [xs, '앞의 두 수를 더해요']; },
        () => { const a = rand(1, 20), d = rand(1, 3); const xs = [a]; for (let i = 0; i < 5; i++) xs.push(xs[i] + d * (i + 1)); return [xs, `더하는 수가 ${d}씩 커져요`]; },
        () => { const s = rand(0, PRIMES.length - 7); return [PRIMES.slice(s, s + 6), '1과 자기 자신으로만 나누어지는 수예요']; },
        () => { const r = pick([2, 3]), n = 4, end = rand(1, 3); const xs = Array.from({ length: n + 1 }, (_, i) => end * r ** (n - i)); return [xs, `${r}로 나눠요`]; },
        () => { const a = rand(1, 9), p = rand(2, 6), m = rand(1, 4); const xs = [a]; for (let i = 1; i < 7; i++) xs.push(i % 2 ? xs[i - 1] + p : xs[i - 1] - m); return [xs, `+${p}, −${m}을 번갈아 해요`]; },
        () => { const s = rand(1, 4); const xs = Array.from({ length: 5 }, (_, i) => (s + i) * (s + i + 1)); return [xs, '1×2, 2×3, 3×4 … 처럼 이웃한 두 수를 곱해요']; },
      ];
      const list = [];
      const seen = new Set();
      while (list.length < count) {
        const [xs, hint] = pick(makers)();
        const key = xs.join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        const shown = xs.slice(0, -1).join(', ');
        list.push({ text: `${shown}, ?`, ask: '?에 들어갈 수는?', answer: String(xs[xs.length - 1]), numeric: true, hint });
      }
      return list;
    },
  },
  {
    id: 'celebs',
    title: '초성 보고 연예인 맞히기',
    desc: '설명을 보고 누군지 떠올려 보세요',
    category: '연예',
    perPlay: 10,
    cover: { image: COVERS.celebs },
    questions: [
      { chosung: true, answer: '싸이', alias: ['PSY'], text: "'강남스타일'로 전 세계를 들썩이게 한 가수" },
      { chosung: true, answer: '아이유', alias: ['IU'], text: "'좋은 날' 3단 고음, 드라마 '나의 아저씨'의 가수 겸 배우" },
      { chosung: true, answer: '유재석', text: "'무한도전'을 이끈 국민 MC" },
      { chosung: true, answer: '송강호', text: "영화 '기생충'에서 기택 역을 맡은 배우" },
      { chosung: true, answer: '윤여정', text: "영화 '미나리'로 아카데미 여우조연상을 받은 배우" },
      { chosung: true, answer: '이정재', text: "'오징어 게임' 기훈 역으로 에미상 남우주연상을 받은 배우" },
      { chosung: true, answer: '방탄소년단', alias: ['BTS', '방탄'], text: "'Dynamite'로 빌보드 핫100 1위에 오른 7인조 그룹" },
      { chosung: true, answer: '블랙핑크', alias: ['BLACKPINK'], text: '지수·제니·로제·리사로 이루어진 걸그룹' },
      { chosung: true, answer: '강호동', text: '씨름 천하장사 출신 예능인' },
      { chosung: true, answer: '이효리', text: "핑클 출신, '텐 미닛'의 솔로 가수" },
      { chosung: true, answer: '보아', alias: ['BoA'], text: "'No.1'을 부른 '아시아의 별'" },
      { chosung: true, answer: '임영웅', text: "'미스터트롯' 초대 우승자" },
      { chosung: true, answer: '박진영', alias: ['JYP'], text: 'JYP엔터테인먼트를 세운 가수 겸 프로듀서' },
      { chosung: true, answer: '마동석', alias: ['돈 리'], text: "'범죄도시' 마석도 역의 배우" },
      { chosung: true, answer: '공유', text: "드라마 '도깨비' 김신, 영화 '부산행' 석우 역의 배우" },
      { chosung: true, answer: '전지현', text: "'엽기적인 그녀', '별에서 온 그대' 천송이 역의 배우" },
      { chosung: true, answer: '이병헌', text: "'오징어 게임' 프론트맨 역의 배우" },
    ],
  },
  {
    id: 'celeb-photos',
    guide: '활동명(예명)으로 써 보세요',
    noAds: true, // 실존 인물 사진이라 광고를 붙이지 않음 (초상권·퍼블리시티권)
    appHidden: true, // 스토어 앱에서는 숨김 (실존 인물 사진 — 앱 심사·초상권)
    title: '사진 보고 연예인 맞히기',
    desc: '누군지 한눈에 알아보시겠어요?',
    category: '연예',
    perPlay: 10,
    cover: { image: COVERS['celeb-photos'] },
    questions: [],
  },
  {
    id: 'movies',
    title: '초성 보고 영화 제목 맞히기',
    desc: '줄거리 한 줄로 영화를 맞혀 보세요',
    category: '연예',
    perPlay: 10,
    cover: { image: COVERS.movies },
    questions: [
      { chosung: true, answer: '기생충', text: '반지하에 사는 가족이 부잣집에 하나둘 취직하며 벌어지는 이야기' },
      { chosung: true, answer: '괴물', text: '한강에 나타난 괴생물체에게 딸을 빼앗긴 가족' },
      { chosung: true, answer: '부산행', text: '좀비 바이러스가 퍼진 KTX 안에서 살아남기' },
      { chosung: true, answer: '올드보이', text: '이유도 모른 채 15년 동안 갇혀 있던 남자의 복수' },
      { chosung: true, answer: '명량', text: '이순신 장군이 12척의 배로 왜군을 막아 낸 해전' },
      { chosung: true, answer: '극한직업', text: '잠복 수사를 위해 치킨집을 차린 마약반 형사들' },
      { chosung: true, answer: '택시운전사', text: '1980년 광주로 외국인 기자를 태우고 간 서울 택시 기사' },
      { chosung: true, answer: '국제시장', text: '흥남 철수부터 파독 광부까지, 한 아버지의 일생' },
      { chosung: true, answer: '해운대', text: '부산 바닷가 도시에 초대형 쓰나미가 덮친다' },
      { chosung: true, answer: '신과함께', alias: ['신과 함께'], text: '저승 차사들이 망자를 49일 동안 일곱 번의 재판에 데려간다' },
      { chosung: true, answer: '타이타닉', text: '침몰하는 호화 여객선에서 피어난 잭과 로즈의 사랑' },
      { chosung: true, answer: '아바타', text: '판도라 행성의 나비족과 그곳을 노리는 인간들' },
      { chosung: true, answer: '겨울왕국', text: '손대는 것마다 얼려 버리는 언니 엘사와 동생 안나' },
      { chosung: true, answer: '라이온 킹', alias: ['라이언 킹'], text: '아버지를 잃은 아기 사자 심바의 성장기' },
      { chosung: true, answer: '쥬라기 공원', alias: ['쥐라기 공원'], text: '공룡을 되살린 테마파크가 통제 불능에 빠진다' },
      { chosung: true, answer: '인터스텔라', text: '죽어 가는 지구를 떠나 웜홀 너머 새 행성을 찾는 우주 비행사들' },
      { chosung: true, answer: '어벤져스', alias: ['어벤저스'], text: '아이언맨·토르·헐크 등 영웅들이 처음 한 팀으로 뭉친다' },
    ],
  },
  {
    id: 'cars',
    guide: '브랜드와 모델명으로 써 보세요 (예: 현대 쏘나타) · 모델명만 써도 정답',
    title: '사진 보고 자동차 모델 맞히기',
    desc: '브랜드 말고 모델 이름까지!',
    category: '탈것',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'vehicles',
    title: '사진 보고 탈것 맞히기',
    desc: '기차·배·비행기, 이름이 뭘까요?',
    category: '탈것',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'dogs',
    guide: '품종 이름을 써 보세요 (예: 골든 리트리버)',
    title: '사진 보고 강아지 품종 맞히기',
    desc: '산책길에 본 그 강아지, 품종은?',
    category: '동물',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'cats',
    guide: '품종 이름을 써 보세요 (예: 러시안 블루)',
    title: '사진 보고 고양이 품종 맞히기',
    desc: '털 모양과 얼굴로 맞혀 보세요',
    category: '동물',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'birds',
    title: '사진 보고 새 이름 맞히기',
    desc: '하늘을 나는 친구들',
    category: '동물',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'insects',
    title: '사진 보고 곤충 맞히기',
    desc: '작지만 이름은 다 있어요',
    category: '동물',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'sea',
    title: '사진 보고 바다 생물 맞히기',
    desc: '바닷속 생물 이름 맞히기',
    category: '동물',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'flowers',
    title: '사진 보고 꽃 이름 맞히기',
    desc: '길가와 꽃집에서 본 그 꽃',
    category: '자연',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'fruits-veg',
    title: '사진 보고 과일·채소 맞히기',
    desc: '마트에서 본 듯한데 이름이…',
    category: '자연',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'food-photos',
    title: '사진 보고 음식 맞히기',
    desc: '세계 음식 사진, 이름은?',
    category: '음식',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'instruments',
    title: '사진 보고 악기 맞히기',
    desc: '국악기부터 오케스트라 악기까지',
    category: '예술',
    perPlay: 10,
    cover: { fromFirst: true }, // 문제 목록의 첫 사진을 표지로
    questions: [],
  },
  {
    id: 'game-chars',
    title: '초성 보고 게임 캐릭터 맞히기',
    desc: '설명 한 줄로 떠올려 보세요',
    category: '게임·만화',
    perPlay: 10,
    cover: { image: COVERS['game-chars'] },
    questions: [],
  },
  {
    id: 'anime-chars',
    title: '초성 보고 만화 캐릭터 맞히기',
    desc: '어릴 때 보던 그 캐릭터, 이름은?',
    category: '게임·만화',
    perPlay: 10,
    cover: { image: COVERS['anime-chars'] },
    questions: [],
  },
  {
    id: 'catchmind',
    title: '그림 보고 맞히기',
    desc: '캐치마인드처럼 한 획씩 그려지는 그림, 먼저 맞혀 보세요!',
    category: '재미',
    perPlay: 10,
    guide: '그림이 다 그려지기 전에 맞혀도 돼요',
    cover: { image: COVERS.catchmind },
    questions: [],
  },
  {
    id: 'lol-champs',
    title: '칭호 보고 롤 챔피언 맞히기',
    desc: '"구미호"는 누구? 리그 오브 레전드 챔피언 이름을 써 보세요',
    category: '게임·만화',
    perPlay: 10,
    cover: { image: COVERS['lol-champs'] },
    questions: [],
  },
  {
    id: 'melody',
    title: '멜로디 듣고 곡 제목 맞히기',
    desc: '클래식·민요 멜로디를 듣고 제목을 써 보세요 (소리 켜기!)',
    category: '음악',
    perPlay: 10,
    guide: '▶ 멜로디 듣기를 눌러 보세요 · 여러 번 들어도 돼요',
    cover: { image: COVERS.melody },
    questions: [],
  },
  {
    id: 'songs',
    title: '가수·초성 보고 노래 제목 맞히기',
    desc: '아이유부터 뉴진스까지, 초성만 보고 노래 제목을 떠올려 보세요',
    category: '음악',
    perPlay: 10,
    cover: { image: COVERS.songs },
    questions: [],
  },
  {
    id: 'char-colors',
    title: '색 조합 보고 캐릭터 맞히기',
    desc: '그림 없이 색깔만! 어떤 캐릭터일까요?',
    category: '게임·만화',
    perPlay: 10,
    cover: { image: COVERS['char-colors'] },
    questions: [],
  },
  {
    id: 'plots',
    title: '줄거리 보고 영화·드라마 맞히기',
    desc: '초성 힌트 없이 줄거리만 보고 제목을 맞혀 보세요',
    category: '연예',
    perPlay: 10,
    cover: { image: COVERS.plots },
    questions: [],
  },
  {
    id: 'movie-ratings',
    title: '영화 관람등급 맞히기',
    desc: '전체·12세·15세·청불 중 몇 세 관람가였을까요?',
    category: '연예',
    perPlay: 10,
    guide: "'전체', '12', '15', '19' 중 하나로 써 보세요 (청불 = 19)",
    cover: { image: COVERS['movie-ratings'] },
    questions: [],
  },
  {
    id: 'dialect',
    title: '사투리 보고 표준어 맞히기',
    desc: '"정구지"가 뭐게? 지역 사투리를 표준어로 바꿔 보세요',
    category: '언어',
    perPlay: 10,
    cover: { image: COVERS.dialect },
    questions: [],
  },
  {
    id: 'memes',
    title: '밈 퀴즈',
    desc: '무야호부터 요즘 밈까지, 인터넷 유행어 얼마나 알아요?',
    category: '재미',
    perPlay: 10,
    cover: { image: COVERS.memes },
    questions: [],
  },
  {
    id: 'mbti',
    title: '성격 보고 MBTI 맞히기',
    desc: '이 사람, 무슨 유형일까요?',
    category: '재미',
    perPlay: 10,
    guide: '알파벳 4글자로 써 보세요 (예: ENFP) · 대소문자 상관없어요',
    cover: { image: COVERS.mbti },
    questions: [],
  },
  {
    id: 'clock',
    guide: "'3시 15분'처럼 써 보세요 · '3:15'도 정답",
    title: '시계 보고 시간 맞히기',
    desc: '"3시 15분"처럼 써 보세요. 풀 때마다 새 시계!',
    category: '수학',
    perPlay: 10,
    cover: { image: COVERS.clock },
    generate(count) {
      const seen = new Set();
      const list = [];
      while (list.length < count) {
        const h = rand(1, 12);
        const m = rand(0, 11) * 5;
        if (seen.has(`${h}:${m}`)) continue;
        seen.add(`${h}:${m}`);
        const mm = String(m).padStart(2, '0');
        const alias = [`${h}:${mm}`, `${h + 12}:${mm}`, `${h}시 ${m}분`];
        if (m === 30) alias.push(`${h}시 반`);
        list.push({
          image: clockSvg(h, m),
          text: '몇 시 몇 분일까요?',
          answer: m === 0 ? `${h}시` : `${h}시 ${m}분`,
          alias,
          hint: m === 0 ? '긴 바늘이 12를 가리켜요' : `짧은 바늘은 ${h}과(와) ${(h % 12) + 1} 사이에 있어요`,
        });
      }
      return list;
    },
  },
];

// data/<퀴즈id>.js 에 문제 목록이 있으면 그것을 쓴다 (없으면 위에 적힌 기본 문제)
for (const quiz of QUIZZES) {
  if (QUESTIONS[quiz.id] && QUESTIONS[quiz.id].length) quiz.questions = QUESTIONS[quiz.id];
}
// 새로 나온 퀴즈 (홈 '새로 나온 퀴즈' 줄과 NEW 표시)
const NEW_QUIZZES = ['trivia-hard', 'catchmind', 'trivia-easy', 'trivia', 'life-trivia', 'lol-champs', 'melody', 'songs', 'char-colors', 'plots', 'movie-ratings', 'dialect', 'memes', 'mbti', 'cars', 'flowers', 'fruits-veg', 'dogs', 'food-photos', 'game-chars', 'anime-chars', 'birds', 'sea', 'cats', 'insects', 'vehicles', 'instruments', 'celeb-photos'];
for (const quiz of QUIZZES) if (NEW_QUIZZES.includes(quiz.id)) quiz.isNew = true;
// 표지를 첫 문제 사진으로 쓰는 퀴즈
for (const quiz of QUIZZES) {
  if (quiz.cover.fromFirst) quiz.cover = { image: quiz.questions[0]?.image };
}
// 문제가 하나도 없는 퀴즈는 목록에서 뺀다 (사진을 아직 못 구한 경우 등)
for (let i = QUIZZES.length - 1; i >= 0; i--) {
  if (!QUIZZES[i].generate && !QUIZZES[i].questions.length) QUIZZES.splice(i, 1);
}

// 퀴즈 형식 (퀴즈 탭 첫 화면에서 형식별로 나눠 들어감). 퀴즈에 format을 직접 쓰면 그걸 따르고,
// 없으면 문제 모양으로 정함: 멜로디 → 소리, 초성 → 초성, 사진·그림 → 이미지, 나머지 → 문제
const QUIZ_FORMATS = [
  { id: 'chosung', title: '초성 퀴즈', emoji: '🔤', desc: '초성만 보고 단어를 떠올려요' },
  { id: 'image', title: '이미지 퀴즈', emoji: '🖼️', desc: '사진·국기·그림을 보고 맞혀요' },
  { id: 'text', title: '문제 퀴즈', emoji: '📝', desc: '상식·설명 문제를 읽고 정답을 써요' },
  { id: 'sound', title: '소리 퀴즈', emoji: '🎵', desc: '멜로디를 듣고 맞혀요' },
];
for (const quiz of QUIZZES) {
  if (quiz.format) continue;
  const sample = quiz.generate ? quiz.generate(5) : quiz.questions;
  const count = {};
  for (const q of sample) {
    const k = q.melody ? 'sound' : q.chosung ? 'chosung' : q.image ? 'image' : 'text';
    count[k] = (count[k] || 0) + 1;
  }
  quiz.format = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || 'text';
}
