// 외국인 방문자용 번역 (구글 웹사이트 번역기).
// - 상단바 🌐 단추(좁은 휴대폰 화면에서는 바닥글 'Language' 링크)로 언어를 고르면 googtrans 쿠키를 저장하고 새로 고침 → 모든 페이지가 그 언어로 열린다.
// - 브라우저 언어가 한국어가 아닌 첫 방문자에게는 아래쪽에 '번역해서 볼까요?' 띠를 한 번 보여 준다.
// - 한국어로 보는 사람은 구글 번역 스크립트를 아예 받지 않는다 (속도·광고에 영향 없음).
(function () {
  const LANGS = [
    ['ko', '한국어'],
    ['en', 'English'],
    ['zh-CN', '简体中文'],
    ['zh-TW', '繁體中文'],
    ['ja', '日本語'],
    ['es', 'Español'],
    ['fr', 'Français'],
    ['de', 'Deutsch'],
    ['pt', 'Português'],
    ['ru', 'Русский'],
    ['vi', 'Tiếng Việt'],
    ['th', 'ไทย'],
    ['id', 'Bahasa Indonesia'],
    ['ar', 'العربية'],
    ['sv', 'Svenska'],
  ];
  const NAME = Object.fromEntries(LANGS);
  // 띠 문구 (번역기가 건드리지 않게 직접 씀)
  const ASK = {
    en: ['This site is in Korean. Translate it?', 'Translate', 'No thanks'],
    'zh-CN': ['本网站为韩语网站，要翻译吗？', '翻译', '不用了'],
    'zh-TW': ['本網站為韓語網站，要翻譯嗎？', '翻譯', '不用了'],
    ja: ['このサイトは韓国語です。翻訳しますか？', '翻訳する', '結構です'],
    es: ['Este sitio está en coreano. ¿Traducirlo?', 'Traducir', 'No, gracias'],
    fr: ['Ce site est en coréen. Le traduire ?', 'Traduire', 'Non merci'],
    de: ['Diese Seite ist auf Koreanisch. Übersetzen?', 'Übersetzen', 'Nein danke'],
    pt: ['Este site está em coreano. Traduzir?', 'Traduzir', 'Não, obrigado'],
    ru: ['Сайт на корейском языке. Перевести?', 'Перевести', 'Нет, спасибо'],
    vi: ['Trang này bằng tiếng Hàn. Dịch không?', 'Dịch', 'Không, cảm ơn'],
    th: ['เว็บไซต์นี้เป็นภาษาเกาหลี ต้องการแปลไหม?', 'แปล', 'ไม่เป็นไร'],
    id: ['Situs ini berbahasa Korea. Terjemahkan?', 'Terjemahkan', 'Tidak'],
    ar: ['هذا الموقع باللغة الكورية. هل تريد ترجمته؟', 'ترجمة', 'لا، شكرًا'],
    sv: ['Den här sidan är på koreanska. Översätta?', 'Översätt', 'Nej tack'],
  };

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 무시 */ } },
  };

  function current() {
    const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[^/;]*\/([^;]+)/);
    const lang = m ? decodeURIComponent(m[1]) : 'ko';
    return NAME[lang] ? lang : 'ko';
  }

  // 구글 번역기는 쿠키를 '이 주소'와 '.도메인' 두 군데에 남기므로 둘 다 지우고 씀
  function setLang(lang) {
    const host = location.hostname;
    const domains = [''];
    if (host.includes('.') && !/^[\d.]+$/.test(host)) {
      const base = host.replace(/^www\./, '');
      domains.push('; domain=' + base, '; domain=.' + base);
    }
    for (const d of domains) document.cookie = 'googtrans=; path=/; max-age=0' + d;
    if (lang !== 'ko') {
      for (const d of domains.slice(0, 2)) document.cookie = 'googtrans=/ko/' + lang + '; path=/; max-age=31536000' + d;
    }
    store.set('lang-asked', '1');
    if (window.gtag) gtag('event', 'translate', { lang });
    location.reload();
  }

  function loadGoogle() {
    const box = document.createElement('div');
    box.id = 'google_translate_element';
    box.hidden = true;
    document.body.appendChild(box);
    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({ pageLanguage: 'ko', autoDisplay: false }, 'google_translate_element');
    };
    const s = document.createElement('script');
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);
  }

  // 언어 고르는 창
  function openPicker() {
    closePicker();
    const now = current();
    const wrap = document.createElement('div');
    wrap.className = 'lang-sheet notranslate';
    wrap.setAttribute('translate', 'no');
    wrap.innerHTML = `
      <div class="lang-panel" role="dialog" aria-modal="true" aria-label="Language">
        <div class="lang-head"><strong>🌐 Language · 언어</strong><button type="button" class="lang-x" aria-label="Close">✕</button></div>
        <div class="lang-list">${LANGS.map(([code, name]) => `<button type="button" data-lang="${code}"${code === now ? ' aria-current="true"' : ''}>${name}</button>`).join('')}</div>
        <p class="lang-note">Machine translation by Google. Answers are graded in Korean or English.<br>구글 자동 번역이에요.</p>
      </div>`;
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-lang]');
      if (b) {
        if (b.dataset.lang !== now) setLang(b.dataset.lang);
        else closePicker();
        return;
      }
      if (e.target === wrap || e.target.closest('.lang-x')) closePicker();
    });
    document.body.appendChild(wrap);
    document.addEventListener('keydown', escClose);
    wrap.querySelector('[aria-current], [data-lang]').focus();
  }
  function escClose(e) { if (e.key === 'Escape') closePicker(); }
  function closePicker() {
    document.querySelector('.lang-sheet')?.remove();
    document.removeEventListener('keydown', escClose);
  }

  // 브라우저 언어 → 고를 언어
  function guess() {
    for (const raw of navigator.languages || [navigator.language || '']) {
      const l = String(raw).toLowerCase();
      if (l.startsWith('ko')) return 'ko';
      if (l.startsWith('zh')) return /tw|hk|mo|hant/.test(l) ? 'zh-TW' : 'zh-CN';
      const short = l.split('-')[0];
      if (NAME[short]) return short;
    }
    return 'en';
  }

  function askBar(lang) {
    const [msg, yes, no] = ASK[lang] || ASK.en;
    const bar = document.createElement('div');
    bar.className = 'lang-ask notranslate';
    bar.setAttribute('translate', 'no');
    bar.innerHTML = `<span>🌐 ${msg}</span><span class="lang-ask-btns"><button type="button" class="lang-yes">${yes} · ${NAME[lang]}</button><button type="button" class="lang-more">${lang === 'en' ? 'Other' : 'Language'}</button><button type="button" class="lang-no" aria-label="${no}">✕</button></span>`;
    bar.querySelector('.lang-yes').onclick = () => setLang(lang);
    bar.querySelector('.lang-more').onclick = () => { bar.remove(); store.set('lang-asked', '1'); openPicker(); };
    bar.querySelector('.lang-no').onclick = () => { bar.remove(); store.set('lang-asked', '1'); };
    document.body.appendChild(bar);
  }

  function init() {
    const lang = current();
    const root = document.documentElement;
    root.dataset.lang = lang;

    // 상단바 🌐 단추
    const bar = document.querySelector('.topbar-inner');
    if (bar && !bar.querySelector('.lang-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn notranslate';
      btn.setAttribute('translate', 'no');
      btn.setAttribute('aria-label', 'Language · 언어');
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>${lang === 'ko' ? '' : `<span>${lang === 'zh-CN' || lang === 'zh-TW' ? '中' : lang.toUpperCase()}</span>`}`;
      btn.onclick = openPicker;
      bar.appendChild(btn);
    }
    // 바닥글 등 어디서든 data-lang-open 링크를 누르면 언어 창
    document.addEventListener('click', (e) => {
      const a = e.target.closest('[data-lang-open]');
      if (!a) return;
      e.preventDefault();
      openPicker();
    });

    if (lang !== 'ko') {
      loadGoogle();
      return;
    }
    if (!store.get('lang-asked')) {
      const want = guess();
      if (want !== 'ko') askBar(want);
    }
  }

  window.QuizLang = { current, open: openPicker };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
