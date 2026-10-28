// 공부용 정리 페이지: 검증해 둔 퀴즈 문제를 주제별 표로 정리해 /study/<id>/ 에 정적 HTML로 만든다.
// tools/build_pages.js 가 불러서 씀. 앱에서 숨기는 문제(appHidden)는 빼고 정리함.

const pick = (re, s, i = 1) => (String(s).match(re) || [])[i] || '';

const STUDY = [
  {
    id: 'idioms',
    intro: [
      '사자성어는 네 글자 안에 옛이야기나 교훈을 담은 한자어예요. 일상 대화와 신문 기사, 시험 문제에도 자주 나와서 뜻을 정확히 알아 두면 글을 읽고 쓰는 데 큰 도움이 돼요.',
      '아래 표는 자주 쓰이는 사자성어 100개와 뜻을 정리한 것이에요. 먼저 뜻만 보고 사자성어를 떠올려 본 뒤 확인하면 더 오래 기억할 수 있어요.',
    ],
    tips: ['비슷한 뜻끼리 묶어 외우면 쉬워요. 예: 일석이조·일거양득(한 번에 두 가지 이득).', '사자성어가 생긴 옛이야기(고사)를 함께 알아 두면 잘 잊히지 않아요.'],
    cols: ['사자성어', '뜻'],
    row: (q) => [q.answer, q.text],
  },
  {
    id: 'spelling',
    intro: [
      '맞춤법은 매일 쓰는 말인데도 막상 쓰려면 헷갈리는 것이 많아요. 특히 소리가 같거나 비슷한 낱말, \'되/돼\'처럼 줄어든 말에서 틀리기 쉬워요.',
      '아래 표에는 많이 틀리는 맞춤법 100가지와 맞는 표기, 그렇게 쓰는 이유를 함께 정리했어요. 이유를 이해해 두면 처음 보는 낱말도 스스로 판단할 수 있어요.',
    ],
    tips: ["'되/돼'는 그 자리에 '되어'를 넣어 말이 되면 '돼', 안 되면 '되'예요.", "'로서'는 자격·지위, '로써'는 수단·도구를 나타내요."],
    cols: ['헷갈리는 표현', '맞는 표기', '이렇게 기억해요'],
    row: (q) => [q.text, q.answer, q.hint || ''],
  },
  {
    id: 'proverbs',
    intro: [
      '속담은 오랜 세월 사람들의 경험과 지혜가 짧은 말로 굳어진 것이에요. 상황을 재치 있게 빗대어 말할 수 있어서 지금도 대화와 글에서 자주 쓰여요.',
      '아래에 우리말 속담 100개를 모았어요. 퀴즈에서는 빈칸을 채우는 방식으로 나오니, 속담 전체를 소리 내어 읽어 보며 익혀 두세요.',
    ],
    tips: ['속담이 어떤 상황에서 쓰이는지 예를 하나씩 떠올려 보면 기억에 오래 남아요.', '뜻이 비슷한 속담끼리, 반대되는 속담끼리 짝지어 보는 것도 좋은 방법이에요.'],
    cols: ['속담'],
    row: (q) => [q.text.replace(/＿+/, q.answer)],
  },
  {
    id: 'slang',
    intro: [
      '요즘은 긴 말을 줄여 부르는 줄임말이 많이 쓰여요. 뉴스와 광고, 회사 대화에서도 흔히 볼 수 있어서 원래 뜻을 알아 두면 세대 차이 없이 대화할 수 있어요.',
      '아래 표는 자주 쓰이는 줄임말과 원래 말을 정리한 것이에요. 다만 공식적인 글이나 어른께 쓰는 글에서는 줄이지 않은 원래 말을 쓰는 것이 좋아요.',
    ],
    tips: ['줄임말은 보통 각 낱말의 첫 글자를 따서 만들어요.', '새 줄임말은 계속 생기니, 모르는 말은 원래 뜻을 꼭 확인하고 쓰세요.'],
    cols: ['줄임말', '원래 말'],
    row: (q) => [q.big, q.answer],
  },
  {
    id: 'antonyms',
    intro: [
      '반대말(반의어)은 뜻이 서로 맞서는 낱말이에요. 반대말을 함께 알면 낱말의 뜻을 더 정확히 이해하고, 글을 쓸 때 표현도 풍부해져요.',
      '아래 표에 기본적인 반대말 100쌍을 정리했어요. 하나의 낱말에 반대말이 여러 개 있는 경우는 괄호 안에 함께 적었어요.',
    ],
    tips: ['반대말은 짝으로 외우세요. 한쪽만 보고 다른 쪽을 바로 떠올릴 수 있으면 충분해요.', '같은 낱말도 쓰임에 따라 반대말이 달라질 수 있어요. 예: 가볍다(무게)↔무겁다.'],
    cols: ['낱말', '반대말'],
    row: (q) => [q.big, q.answer + (q.alias && q.alias.length ? ` (${q.alias.join(', ')})` : '')],
  },
  {
    id: 'baby-animals',
    intro: [
      '동물의 새끼는 어미와 다른 이름으로 부르는 경우가 많아요. 개구리의 올챙이, 닭의 병아리처럼 잘 알려진 것도 있지만, 곰의 능소니처럼 처음 듣는 이름도 있어요.',
      '아래 표에 동물과 곤충의 새끼·애벌레 이름을 모았어요. 아이와 함께 보며 이야기 나누기에도 좋아요.',
    ],
    tips: ['곤충은 알에서 깨어난 뒤 애벌레 시기를 거치는 경우가 많아요.', '같은 동물도 지역이나 크기에 따라 다른 이름으로 부르기도 해요.'],
    cols: ['무엇의 새끼일까요', '이름'],
    row: (q) => [q.text.replace(/[은는]\?$/, ''), q.answer],
  },
  {
    id: 'elements',
    intro: [
      '원소는 물질을 이루는 가장 기본적인 성분이에요. 지금까지 확인된 원소는 118가지이고, 각 원소는 알파벳 한두 글자의 원소 기호로 나타내요.',
      '아래 표는 원자 번호 1번 수소부터 118번 오가네손까지 원소 기호와 이름을 순서대로 정리한 것이에요. 원소 이름은 대한화학회 기준 한글 이름을 따랐어요.',
    ],
    tips: ['앞쪽 20개(수소~칼슘)만 먼저 외워도 과학 시간에 나오는 대부분의 원소를 알 수 있어요.', '기호가 라틴어에서 온 원소도 있어요. 예: 나트륨 Na, 칼륨 K, 철 Fe, 금 Au.'],
    cols: ['번호', '기호', '이름'],
    row: (q, i) => [String(i + 1), q.big, q.answer],
  },
  {
    id: 'capitals',
    intro: [
      '나라의 수도가 가장 큰 도시라고 생각하기 쉽지만, 실제로는 그렇지 않은 나라가 많아요. 호주의 수도는 시드니가 아니라 캔버라이고, 캐나다의 수도는 토론토가 아니라 오타와예요.',
      '아래 표에 헷갈리기 쉬운 나라 100곳의 수도를 정리했어요. 나라 이름과 수도 이름은 국립국어원 외래어 표기법을 따랐어요.',
    ],
    tips: ['수도가 최대 도시와 다른 나라를 따로 모아 외우면 실수를 줄일 수 있어요.', '최근에 수도를 옮기거나 이름을 바꾼 나라도 있으니 오래된 자료와 비교할 때 주의하세요.'],
    cols: ['나라', '수도'],
    row: (q) => [q.text.replace(/의 수도는\?$/, ''), q.answer],
  },
  {
    id: 'dialect',
    intro: [
      '사투리(방언)는 지역마다 다르게 발달한 말로, 그 지역의 생활과 문화가 담겨 있어요. 표준어와 뜻이 같아도 말맛이 달라서 알아 두면 대화가 한층 즐거워져요.',
      '아래 표에 경상도·전라도·충청도·강원도·제주·평안도·함경도의 사투리와 표준어 뜻을 정리했어요. 같은 말이 여러 지역에서 쓰이기도 해서 지역은 대표적인 곳을 적었어요.',
    ],
    tips: ['제주어는 다른 지역 말과 차이가 커서 따로 하나의 언어로 보기도 해요.', '사투리는 틀린 말이 아니라 지역의 소중한 말이에요.'],
    cols: ['사투리', '지역', '표준어'],
    row: (q) => {
      const quoted = q.text.match(/^"(.+)" \((.+)\)$/);
      if (quoted) return [quoted[1], quoted[2], q.answer];
      return [q.big || '', q.text.split(' · ')[0].replace(/ 사투리$/, ''), q.answer];
    },
  },
  {
    id: 'history',
    intro: [
      '한국사에는 나라를 세운 왕부터 독립운동가, 과학자와 예술가까지 기억해야 할 인물이 많아요. 인물을 업적과 함께 알아 두면 역사의 흐름을 이해하기 쉬워져요.',
      '아래 표는 교과서에 자주 나오는 우리 역사 인물 100명을 한 줄 설명과 함께 정리한 것이에요. 설명만 보고 인물을 떠올려 본 뒤 확인해 보세요.',
    ],
    tips: ['같은 시대 인물끼리 묶어 보면 사건의 앞뒤 관계가 보여요.', '호(예: 율곡, 퇴계)나 시호(예: 충무공)로도 불리는 인물은 함께 기억해 두세요.'],
    cols: ['설명', '인물'],
    row: (q) => [q.text.replace(/[은는]\?$/, ''), q.answer],
  },
];

function buildStudy({ read, write, esc, SITE, QUIZZES, QUESTIONS, STUDY_PAGES, urls }) {
  // 처리방침 페이지 머리(통계·글꼴·표 스타일)를 그대로 씀
  const pv = read('privacy.html');
  const headTpl = pv.slice(0, pv.indexOf('<main class="container policy">'));
  const head = (title, desc, url) =>
    headTpl
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>\n  <meta name="description" content="${esc(desc)}">\n  <link rel="canonical" href="${url}">`)
      .replace(/href="icons\//g, 'href="/icons/')
      .replace(/src="icons\//g, 'src="/icons/')
      .replace('href="style.css"', 'href="/style.css"');
  const foot = `<p class="meta" style="text-align:center"><a href="/">← 퀴즈 홈</a> · <a href="/study/">공부하기</a> · <a href="/about.html">소개</a> · <a href="/terms.html">이용약관</a> · <a href="/privacy.html">개인정보 처리방침</a> · <a href="mailto:tminews@naver.com">문의</a></p>
  </main>
  <script src="/holiday.js"></script>
</body>
</html>
`;
  const list = [];
  for (const s of STUDY) {
    const quiz = QUIZZES.find((q) => q.id === s.id);
    const qs = (QUESTIONS[s.id] || []).filter((q) => !q.appHidden);
    if (!quiz || !qs.length) continue;
    const title = STUDY_PAGES[s.id];
    const rows = qs.map((q, i) => s.row(q, i));
    const others = STUDY.filter((x) => x.id !== s.id).map((x) => `<li><a href="/study/${x.id}/">${esc(STUDY_PAGES[x.id])}</a></li>`).join('');
    const html = `${head(`${title} - 맞혀봐 공부하기`, `${title}. ${s.intro[0]}`, `${SITE}/study/${s.id}/`)}<main class="container policy">
    <h1>${esc(title)}</h1>
    <p class="meta">맞혀봐 공부하기 · 모두 ${rows.length}개</p>
    <section>${s.intro.map((p) => `<p>${esc(p)}</p>`).join('')}</section>
    <section>
      <h2>한눈에 보기</h2>
      <div class="table-wrap"><table>
        <tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>
        ${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('\n        ')}
      </table></div>
    </section>
    <section>
      <h2>외우는 요령</h2>
      <ul>${s.tips.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
    </section>
    <section>
      <h2>퀴즈로 확인해 보기</h2>
      <p>다 읽었다면 <a href="/q/${s.id}/">${esc(quiz.title)}</a>에서 직접 써서 맞혀 보세요. 보기 없이 정답을 떠올려 써야 해서 진짜 실력을 확인할 수 있어요.</p>
    </section>
    <section>
      <h2>다른 정리 보기</h2>
      <ul>${others}</ul>
    </section>
    ${foot}`;
    write(`study/${s.id}/index.html`, html);
    urls.push(`/study/${s.id}/`);
    list.push({ s, title, n: rows.length, quiz });
  }
  // 목록 페이지
  const index = `${head('공부하기 - 맞혀봐', '사자성어, 맞춤법, 속담, 줄임말, 반대말, 원소 기호, 세계 수도, 사투리, 역사 인물을 표로 한눈에 정리했어요.', `${SITE}/study/`)}<main class="container policy">
    <h1>공부하기</h1>
    <p class="meta">퀴즈에 나오는 내용을 주제별로 정리했어요</p>
    <section>
      <p>맞혀봐의 퀴즈는 보기 없이 정답을 직접 써야 해서, 미리 한 번 훑어보고 풀면 훨씬 잘 맞힐 수 있어요. 주제마다 자주 나오는 내용을 표로 정리하고 외우는 요령도 함께 적었어요.</p>
    </section>
    <section>
      <ul>${list.map(({ s, title, n }) => `<li><a href="/study/${s.id}/">${esc(title)}</a> — ${n}개 · ${esc(s.intro[0].split('. ')[0])}.</li>`).join('')}</ul>
    </section>
    ${foot}`;
  write('study/index.html', index);
  urls.push('/study/');
}

module.exports = { buildStudy, STUDY };
