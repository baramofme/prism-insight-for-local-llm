/* Google Finance(베타) 영역 + 세밀 태거 — 콘솔에 붙여넣기.
 * 난독화 클래스에 읽기 쉬운 data-gf 이름 부여(클래스 우선 + 텍스트/위치 fallback),
 * MutationObserver로 재렌더 후에도 유지. 이후 [data-gf="..."]로 선택/캡처/검사.
 *
 *   __gfList()  → 태깅 목록+폭   __gfSrc('gf-main') → 소스+스타일   __gfStop() → 중지
 */
(() => {
  const cs = (el, p) => parseInt(getComputedStyle(el)[p]) || 0;
  const divs = () => [...document.querySelectorAll('div')];
  const root = (n) => document.querySelector(`[data-gf="${n}"]`);
  const leafEq = (r, t) => r && [...r.querySelectorAll('*')].find(e => e.childElementCount === 0 && e.textContent.trim() === t);
  const leafRe = (r, re) => r && [...r.querySelectorAll('*')].find(e => e.childElementCount === 0 && re.test(e.textContent.trim()));
  const up = (el, r, minW) => { let n = el; while (n && n !== r) { if (n.getBoundingClientRect().width >= minW) return n; n = n.parentElement; } return el; };
  const set = (name, el) => { if (el && el.getAttribute('data-gf') !== name) { el.setAttribute('data-gf', name); el.style.outline = '1px dashed rgba(255,0,128,.4)'; } };

  // ── 1) 최상위 영역 ──
  const REGIONS = [
    { name: 'gf-header', sel: '.YXDqL', find: () => divs().find(e => { const r = e.getBoundingClientRect(); return r.top <= 2 && r.width > innerWidth * 0.8 && r.height >= 60 && r.height <= 120 && /Finance/.test(e.textContent); }) },
    { name: 'gf-left-nav', sel: '.t4pbz', find: () => divs().find(e => getComputedStyle(e).position === 'fixed' && e.getBoundingClientRect().x <= 2 && e.getBoundingClientRect().y > 40 && e.getBoundingClientRect().y < 160 && /목록/.test(e.textContent.slice(0, 6))) },
    { name: 'gf-left-nav-inner', sel: '.d0WT0b' },
    { name: 'gf-nav-item', sel: '.UHCxXe' },
    { name: 'gf-main', sel: '.Y8k45b', find: () => divs().find(e => cs(e, 'marginLeft') >= 80 && cs(e, 'paddingLeft') === 24 && e.getBoundingClientRect().width > 400) },
    { name: 'gf-right-panel', sel: '.OWRwWb', find: () => divs().find(e => { const r = e.getBoundingClientRect(); return r.x > innerWidth * 0.6 && r.width > 200 && r.height > 300; }) },
    { name: 'gf-footer', sel: '.DrZEDd', find: () => divs().find(e => /AI 콘텐츠/.test(e.textContent) && e.getBoundingClientRect().width > 500) },
  ];

  // ── 2) 영역 내부 세밀 ── [name, 부모영역, finder(root)->el, minW(블록 상향, 0=leaf)]
  const SUBS = [
    // gf-main (종목 상세)
    ['gf-main-breadcrumb', 'gf-main', r => leafRe(r, /KRX/), 200],
    ['gf-main-stockheader', 'gf-main', r => leafEq(r, 'SK하이닉스') || leafRe(r, /^[가-힣A-Za-z]/), r => r.getBoundingClientRect().width * 0.6],
    ['gf-main-stockname', 'gf-main', r => leafEq(r, 'SK하이닉스'), 0],
    ['gf-main-price', 'gf-main', r => leafRe(r, /^[₩$¥][\d,]/), 0],
    ['gf-main-chart', 'gf-main', r => { const s = r.querySelector('svg'); return s ? up(s, r, 300) : null; }, 0],
    ['gf-main-periodtabs', 'gf-main', r => leafEq(r, '1D') || leafEq(r, '1일'), 200],
    ['gf-main-contenttabs', 'gf-main', r => leafEq(r, '개요'), 200],
    ['gf-main-metrics', 'gf-main', r => leafEq(r, '시가총액') || leafEq(r, '시가'), r => r.getBoundingClientRect().width * 0.5],
    ['gf-main-related', 'gf-main', r => leafRe(r, /관련/), r => r.getBoundingClientRect().width * 0.5],
    ['gf-main-news', 'gf-main', r => leafRe(r, /^뉴스|뉴스 기사/), r => r.getBoundingClientRect().width * 0.5],
    ['gf-main-profile', 'gf-main', r => leafRe(r, /^프로필|정보$/), r => r.getBoundingClientRect().width * 0.5],
    // gf-header
    ['gf-header-logo', 'gf-header', r => leafRe(r, /^Finance/), 0],
    ['gf-header-marketnav', 'gf-header', r => { const l = [...r.querySelectorAll('*')].find(e => /홈/.test(e.textContent) && /조사/.test(e.textContent) && e.getBoundingClientRect().width > 200 && e.getBoundingClientRect().width < 900); return l || null; }, 0],
    ['gf-header-search', 'gf-header', r => { const i = r.querySelector('input'); return i ? up(i, r, 150) : null; }, 0],
    ['gf-header-profile', 'gf-header', r => r.querySelector('img[alt],a[aria-label]'), 0],
    // gf-left-nav
    ['gf-leftnav-listdropdown', 'gf-left-nav', r => leafRe(r, /^목록/), 80],
    ['gf-leftnav-investing', 'gf-left-nav', r => leafEq(r, '투자중'), 80],
    ['gf-leftnav-watchlist', 'gf-left-nav', r => leafEq(r, '관심 목록'), 80],
    ['gf-leftnav-sectors', 'gf-left-nav', r => leafEq(r, '주식 업종'), 80],
    // gf-right-panel
    ['gf-right-greeting', 'gf-right-panel', r => leafRe(r, /안녕하세요|님,/), 0],
    ['gf-right-popularq', 'gf-right-panel', r => leafRe(r, /인기 질문/), 150],
    ['gf-right-input', 'gf-right-panel', r => { const i = r.querySelector('input,textarea'); return i ? up(i, r, 150) : null; }, 0],
    // gf-footer
    ['gf-footer-disclaimer', 'gf-footer', r => leafRe(r, /AI 콘텐츠|오류/), 0],
  ];

  const apply = () => {
    for (const p of REGIONS) { const el = document.querySelector(p.sel) || (p.find && p.find()); set(p.name, el); }
    for (const [name, rootName, finder, minW] of SUBS) {
      const r = root(rootName); if (!r) continue;
      let el = finder(r);
      if (el && minW) { const w = typeof minW === 'function' ? minW(r) : minW; el = up(el, r, w); }
      set(name, el);
    }
  };
  apply();
  const obs = new MutationObserver(apply);
  obs.observe(document.body, { childList: true, subtree: true });
  window.__gfStop = () => { obs.disconnect(); console.log('gf-tagger stopped'); };
  window.__gfList = () => console.table([...document.querySelectorAll('[data-gf]')].map(el => ({ name: el.getAttribute('data-gf'), w: Math.round(el.getBoundingClientRect().width), text: (el.textContent || '').trim().slice(0, 24) })));
  window.__gfSrc = (name) => { const el = root(name); if (!el) return '(없음)'; const s = getComputedStyle(el);
    return { name, html: el.outerHTML.slice(0, 600), box: (r => ({ x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }))(el.getBoundingClientRect()),
      style: { display: s.display, position: s.position, width: s.width, maxWidth: s.maxWidth, margin: s.margin, padding: s.padding, gap: s.gap, flex: `${s.flexGrow}/${s.flexShrink}/${s.flexBasis}` } }; };
  console.log('%cgf-tagger(영역+세밀) 적용됨. __gfList() 로 전체 목록 확인.', 'color:#0a7;font-weight:bold');
})();
