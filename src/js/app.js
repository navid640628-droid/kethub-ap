/* کتاب‌باز — منطق صفحه‌ی اصلی (SPA سبک، بدون کتابخانه).
   داده‌ها از window.__DATA__ خوانده می‌شود که build.js از فایل‌های JSON
   داخل پوشه‌ی content/ ساخته و مستقیم در index.html تزریق کرده است. */
(function(){
"use strict";

const DATA = window.__DATA__ || {books:[], audiobooks:[], podcasts:[], facts:[], authors:[], site:{}};
const BOOKS = DATA.books;
const AUDIOBOOKS = DATA.audiobooks;
const PODCASTS = DATA.podcasts;
const FACTS = DATA.facts;
const AUTHORS = DATA.authors;
const SITE = DATA.site || {};

const PALETTES = [
  ["#2D6A4F","#0F2D22"], ["#7A6B2F","#3A3010"], ["#1B4332","#0A1F16"],
  ["#A8542E","#5C2A14"], ["#3D6A92","#16334A"], ["#6B3F6E","#2E1A30"],
  ["#52796F","#1E3A30"], ["#9A6B2E","#4A330F"]
];
function paletteFor(id){ return PALETTES[id % PALETTES.length]; }

function fmtTime(sec){
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  const mm = String(m).padStart(2,'0'), ss = String(s).padStart(2,'0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}
function toFa(n){
  const digits = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).replace(/[0-9]/g, d => digits[d]);
}

/* ============================================================
   رندر
   ============================================================ */
let activeTab = STORE.getLastTab();
let searchQuery = '';
let favFilterOnly = false;

const TABS = [
  {key:'books', label:'کتاب‌ها', icon:ICONS.bookOpen},
  {key:'audiobooks', label:'کتاب صوتی', icon:ICONS.headphones},
  {key:'podcasts', label:'پادکست‌ها', icon:ICONS.mic},
  {key:'facts', label:'حاشیه‌ها', icon:ICONS.sparkle},
  {key:'authors', label:'مشاهیر', icon:ICONS.user}
];

function appShell(){
  return `
    <header class="app-header">
      <div class="header-row">
        <div class="brand">
          <div class="brand-mark">${ICONS.bookOpen.replace('currentColor','#F6F3EA')}</div>
          <div class="brand-text">
            <h1>${SITE.siteName || 'کتاب‌باز'}</h1>
            <p>${SITE.defaultDescription || ''}</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="install-btn" id="installBtn">${ICONS.download}<span>نصب اپ</span></button>
          <button class="icon-btn" id="favTabBtn" aria-label="علاقه‌مندی‌ها" title="علاقه‌مندی‌ها">${ICONS.bookmark}</button>
        </div>
      </div>
      <div class="search-row">
        <input id="searchInput" type="text" placeholder="جست‌وجوی کتاب، نویسنده یا موضوع…" value="${searchQuery}">
        ${ICONS.search}
      </div>
    </header>
    <main class="app-main" id="appMain"></main>
    <div class="mini-player" id="miniPlayer"></div>
    <nav class="bottom-nav" id="bottomNav">
      ${TABS.map(t => `
        <button class="nav-btn ${t.key===activeTab?'active':''}" data-tab="${t.key}">
          ${t.icon}<span>${t.label}</span>
        </button>`).join('')}
    </nav>
  `;
}

function emptyState(label, hint){
  return `<div class="empty-state">${ICONS.empty}<h3>${label}</h3><p>${hint}</p></div>`;
}

function matchesQuery(text){
  if(!searchQuery) return true;
  return text.toLowerCase().includes(searchQuery.toLowerCase());
}

function renderBooks(){
  let items = BOOKS.filter(b => matchesQuery(b.title + ' ' + b.author + ' ' + b.genre));
  if(favFilterOnly) items = items.filter(b => STORE.isFav(b.id));
  const genres = [...new Set(BOOKS.map(b => b.genre))];

  const chips = `
    <div class="chip-row" id="genreChips">
      <button class="chip ${!window.__activeGenre?'active':''}" data-genre="">همه</button>
      ${genres.map(g => `<button class="chip ${window.__activeGenre===g?'active':''}" data-genre="${g}">${g}</button>`).join('')}
    </div>`;

  if(window.__activeGenre){
    items = items.filter(b => b.genre === window.__activeGenre);
  }

  if(items.length === 0){
    return `
      <div class="section-title"><h2>کتاب‌ها</h2><span>${toFa(items.length)} کتاب</span></div>
      ${chips}
      ${emptyState(favFilterOnly ? 'هنوز چیزی نشان نکرده‌ای' : 'کتابی پیدا نشد', favFilterOnly ? 'روی نشان‌گوشه‌ی هر کتاب بزن تا اینجا اضافه شود.' : 'عبارت دیگری را جست‌وجو کن.')}
    `;
  }

  return `
    <div class="section-title">
      <h2>${favFilterOnly ? 'علاقه‌مندی‌های من' : 'کتاب‌ها'}</h2>
      <span>${toFa(items.length)} کتاب</span>
    </div>
    ${chips}
    <div class="grid">
      ${items.map(bookCard).join('')}
    </div>
  `;
}

function bookCard(b){
  const [c1,c2] = paletteFor(b.id);
  const isFav = STORE.isFav(b.id);
  const href = `/books/${b.slug}/`;
  const coverInner = b.cover
    ? `<img src="/${b.cover}" alt="" loading="lazy">`
    : `<span class="spine"></span><span class="glyph">${b.glyph}</span>`;
  return `
    <article class="book-card ${isFav?'is-fav':''}" style="--c1:${c1};--c2:${c2}">
      <a class="book-cover" href="${href}" aria-label="${b.title}">
        ${coverInner}
      </a>
      <button class="bookmark-hit" data-fav="${b.id}" aria-label="افزودن به علاقه‌مندی"></button>
      <span class="bookmark">${ICONS.bookmark}</span>
      <div class="book-body">
        <a href="${href}" style="display:block;">
          <span class="book-genre">${b.genre}</span>
          <h3 class="book-title">${b.title}</h3>
        </a>
        <p class="book-author">${b.author}</p>
        <div class="book-actions">
          <button class="btn-icon fav-btn ${isFav?'active':''}" data-fav="${b.id}" aria-label="علاقه‌مندی">${ICONS.heart}</button>
          <a class="btn-icon pdf" href="/${b.pdf}" target="_blank" rel="noopener" aria-label="دانلود PDF">${ICONS.pdf}</a>
          <a class="btn-icon tg" href="${SITE.telegramUrl}" target="_blank" rel="noopener" aria-label="کانال تلگرام">${ICONS.telegram}</a>
        </div>
      </div>
    </article>
  `;
}

function renderAudiobooks(){
  let items = AUDIOBOOKS.filter(b => matchesQuery(b.title + ' ' + b.author));

  if(items.length === 0){
    return `<div class="section-title"><h2>کتاب صوتی</h2></div>${emptyState('چیزی پیدا نشد','عبارت دیگری را جست‌وجو کن.')}`;
  }

  return `
    <div class="section-title"><h2>کتاب صوتی</h2><span>${toFa(items.length)} عنوان</span></div>
    <div class="list">
      ${items.map(a => {
        const [c1,c2] = paletteFor(a.id);
        const saved = STORE.getBookProgress(a.id);
        const isThisBook = Player.book && Player.book.id === a.id;
        const isPlayingThis = isThisBook && Player.playing;
        const isExpanded = window.__expandedBook === a.id;
        const resumeChapterLabel = a.chapters[saved.chapter] ? a.chapters[saved.chapter].title : a.chapters[0].title;

        return `
        <div class="audiobook-block">
          <div class="row-card audiobook-card ${isExpanded?'expanded':''}" data-audiobook="${a.id}">
            <div class="row-avatar" style="--c1:${c1};--c2:${c2}">${a.glyph}</div>
            <div class="row-content" data-toggle-chapters="${a.id}">
              <a href="/audiobooks/${a.slug}/" class="row-title" style="display:block;">${a.title}</a>
              <p class="row-sub">${a.author} · ${toFa(a.chapters.length)} فصل</p>
              <p class="row-sub" style="margin-top:3px;">${isThisBook ? (isPlayingThis ? 'در حال پخش — ' : 'مکث — ') + a.chapters[Player.chapterIndex].title : 'ادامه از ' + resumeChapterLabel}</p>
            </div>
            <button class="btn-icon play" data-play="${a.id}" aria-label="پخش">
              ${isPlayingThis ? ICONS.pause : ICONS.play}
            </button>
          </div>
          <div class="chapter-list ${isExpanded?'show':''}">
            ${a.chapters.map((ch, i) => {
              const activeCh = isThisBook && Player.chapterIndex === i;
              return `
              <button class="chapter-row ${activeCh?'active':''}" data-chapter-book="${a.id}" data-chapter-index="${i}">
                <span class="chapter-dot">${activeCh && isPlayingThis ? ICONS.pause : ICONS.play}</span>
                <span>${ch.title}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderPodcasts(){
  let items = PODCASTS.filter(p => matchesQuery(p.title + ' ' + p.desc));
  if(items.length === 0){
    return `<div class="section-title"><h2>پادکست‌ها</h2></div>${emptyState('چیزی پیدا نشد','عبارت دیگری را جست‌وجو کن.')}`;
  }
  return `
    <div class="section-title"><h2>پادکست‌ها</h2><span>${toFa(items.length)} قسمت</span></div>
    <div class="list">
      ${items.map(p => {
        const [c1,c2] = paletteFor(p.id);
        return `
        <div class="row-card">
          <div class="row-avatar round" style="--c1:${c1};--c2:${c2}">${ICONS.mic.replace('currentColor','#F6F3EA')}</div>
          <div class="row-content">
            <p class="row-title">${p.title}</p>
            <p class="row-text">${p.desc}</p>
            <div class="row-meta"><span class="tag">${p.len}</span><span class="tag">${p.host}</span></div>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderFacts(){
  let items = FACTS.filter(f => matchesQuery(f.title + ' ' + f.text));
  if(items.length === 0){
    return `<div class="section-title"><h2>حقایق و حاشیه‌های کتاب</h2></div>${emptyState('چیزی پیدا نشد','عبارت دیگری را جست‌وجو کن.')}`;
  }
  return `
    <div class="section-title"><h2>حقایق و حاشیه‌های کتاب</h2><span>${toFa(items.length)} حاشیه</span></div>
    <div class="list">
      ${items.map(f => `
        <div class="row-card">
          <div class="row-content">
            <p class="row-title">${f.title}</p>
            <p class="row-text fact-quote">${f.text}</p>
          </div>
        </div>`).join('')}
    </div>
  `;
}

function renderAuthors(){
  let items = AUTHORS.filter(a => matchesQuery(a.name + ' ' + a.bio));
  if(items.length === 0){
    return `<div class="section-title"><h2>مشاهیر و نویسندگان</h2></div>${emptyState('چیزی پیدا نشد','عبارت دیگری را جست‌وجو کن.')}`;
  }
  return `
    <div class="section-title"><h2>مشاهیر و نویسندگان</h2><span>${toFa(items.length)} نفر</span></div>
    <div class="list">
      ${items.map(a => {
        const [c1,c2] = paletteFor(a.id);
        return `
        <div class="row-card">
          <div class="row-avatar round" style="--c1:${c1};--c2:${c2}">${a.name[0]}</div>
          <div class="row-content">
            <p class="row-title">${a.name}</p>
            <p class="row-sub">${a.years}</p>
            <p class="row-text">${a.bio}</p>
          </div>
        </div>`;
      }).join('')}
    </div>
  `;
}

function renderMain(){
  const main = document.getElementById('appMain');
  if(!main) return;
  let html = '';
  if(activeTab === 'books') html = renderBooks();
  else if(activeTab === 'audiobooks') html = renderAudiobooks();
  else if(activeTab === 'podcasts') html = renderPodcasts();
  else if(activeTab === 'facts') html = renderFacts();
  else if(activeTab === 'authors') html = renderAuthors();
  main.innerHTML = html;
}

function refreshAudiobooksRowIfActive(){
  if(activeTab === 'audiobooks'){
    renderMain();
    bindMainEvents();
  }
}

let miniPlayerBuilt = false;

function buildMiniPlayerShell(el){
  el.innerHTML = `
    <div class="mini-cover" id="miniCover"></div>
    <div class="mini-info">
      <p id="miniTitle"></p>
      <span class="mini-time" id="mpTime"></span>
      <div class="seek-wrap" id="seekWrap">
        <div class="mini-progress"><div id="seekFill" style="width:0%"><span class="seek-thumb" id="seekThumb"></span></div></div>
      </div>
    </div>
    <button class="mini-btn" id="mpBack" aria-label="۱۵ ثانیه عقب">${ICONS.back15}</button>
    <button class="mini-btn" id="mpToggle" aria-label="پخش/توقف">${ICONS.play}</button>
    <button class="mini-btn" id="mpFwd" aria-label="۱۵ ثانیه جلو">${ICONS.fwd15}</button>
    <button class="mini-btn close" id="mpClose" aria-label="بستن">${ICONS.close}</button>
  `;
  document.getElementById('mpToggle').addEventListener('click', () => Player.toggle());
  document.getElementById('mpBack').addEventListener('click', () => Player.seekBy(-15));
  document.getElementById('mpFwd').addEventListener('click', () => Player.seekBy(15));
  document.getElementById('mpClose').addEventListener('click', () => Player.close());
  bindSeekDrag(document.getElementById('seekWrap'));
  miniPlayerBuilt = true;
}

/* این تابع ساختار پلیر مینی را فقط یک‌بار می‌سازد و در رندرهای بعدی فقط
   مقدارها (زمان، درصد نوار، آیکن پخش/توقف) را آپدیت می‌کند — نه کل DOM را.
   این مهم است چون اگر کل innerHTML هر چند ثانیه بازسازی شود، هم کلیک روی
   دکمه‌ها گاهی گم می‌شود و هم کشیدن انگشت روی نوار پیشرفت قطع می‌شود. */
function renderMiniPlayer(){
  const el = document.getElementById('miniPlayer');
  if(!el) return;
  if(!Player.book){
    el.classList.remove('show');
    el.innerHTML = '';
    miniPlayerBuilt = false;
    return;
  }
  if(!miniPlayerBuilt) buildMiniPlayerShell(el);
  el.classList.add('show');

  const b = Player.book;
  const ch = b.chapters[Player.chapterIndex];
  const duration = Player.audioEl.duration || 0;
  const elapsed = Player.audioEl.currentTime || 0;
  const pct = duration > 0 ? Math.min(100, Math.round((elapsed/duration)*100)) : 0;
  const [c1,c2] = paletteFor(b.id);
  el.style.setProperty('--c1', c1);
  el.style.setProperty('--c2', c2);

  document.getElementById('miniCover').textContent = b.glyph;
  document.getElementById('miniTitle').textContent = `${b.title} · ${ch.title}`;
  document.getElementById('mpTime').textContent = `${fmtTime(elapsed)} / ${duration ? fmtTime(duration) : '…'}`;
  if(!Player.scrubbing){
    document.getElementById('seekFill').style.width = pct + '%';
  }
  document.getElementById('mpToggle').innerHTML = Player.playing ? ICONS.pause : ICONS.play;
}

function fractionFromClientX(wrap, clientX){
  const rect = wrap.getBoundingClientRect();
  const fraction = (rect.right - clientX) / rect.width;
  return Math.min(1, Math.max(0, fraction));
}

function applySeekVisual(fraction){
  const fill = document.getElementById('seekFill');
  const timeEl = document.getElementById('mpTime');
  const duration = Player.audioEl ? (Player.audioEl.duration || 0) : 0;
  if(!fill || !Player.book || !duration) return 0;
  const seconds = fraction * duration;
  fill.style.width = (fraction * 100) + '%';
  if(timeEl) timeEl.textContent = `${fmtTime(seconds)} / ${fmtTime(duration)}`;
  return seconds;
}

function bindSeekDrag(wrap){
  if(!wrap) return;
  let lastFraction = 0;
  let wasPlayingBeforeScrub = false;

  function onMove(e){
    lastFraction = fractionFromClientX(wrap, e.clientX);
    applySeekVisual(lastFraction); // فقط نمایش را آپدیت می‌کند، هنوز پخش واقعی جابه‌جا نمی‌شود
  }
  function onUp(e){
    wrap.classList.remove('dragging');
    wrap.removeEventListener('pointermove', onMove);
    wrap.removeEventListener('pointerup', onUp);
    wrap.removeEventListener('pointercancel', onUp);

    const duration = Player.audioEl.duration || 0;
    Player.seekTo(lastFraction * duration);
    Player.scrubbing = false;
    Player.saveProgress();
    if(wasPlayingBeforeScrub){
      Player.audioEl.play().catch(() => {});
    }
    renderMiniPlayer();
  }
  wrap.addEventListener('pointerdown', (e) => {
    if(!Player.book || !Player.audioEl.duration) return;
    e.preventDefault();
    wasPlayingBeforeScrub = !Player.audioEl.paused;
    if(wasPlayingBeforeScrub) Player.audioEl.pause();
    Player.scrubbing = true;
    wrap.classList.add('dragging');
    try{ wrap.setPointerCapture(e.pointerId); }catch(err){}
    onMove(e);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('pointercancel', onUp);
  });
}

let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  const inner = document.getElementById('toastInner');
  inner.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ============================================================
   بایند رویدادها
   ============================================================ */
function bindShellEvents(){
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      favFilterOnly = false;
      STORE.setLastTab(activeTab);
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
      renderMain();
      bindMainEvents();
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  document.getElementById('favTabBtn').addEventListener('click', () => {
    activeTab = 'books';
    favFilterOnly = true;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab==='books'));
    renderMain();
    bindMainEvents();
  });

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderMain();
    bindMainEvents();
  });

  const installBtn = document.getElementById('installBtn');
  installBtn.addEventListener('click', async () => {
    if(window.__deferredInstallPrompt){
      window.__deferredInstallPrompt.prompt();
      const choice = await window.__deferredInstallPrompt.userChoice;
      if(choice.outcome === 'accepted') showToast('کتاب‌باز نصب شد ✓');
      window.__deferredInstallPrompt = null;
      installBtn.classList.remove('show');
    }
  });
  if(window.__deferredInstallPrompt) installBtn.classList.add('show');
}

function bindMainEvents(){
  document.querySelectorAll('[data-fav]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const id = Number(btn.dataset.fav);
      const nowFav = STORE.toggleFav(id);
      showToast(nowFav ? 'به علاقه‌مندی‌ها افزوده شد' : 'از علاقه‌مندی‌ها حذف شد');
      renderMain();
      bindMainEvents();
    });
  });

  document.querySelectorAll('#genreChips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      window.__activeGenre = chip.dataset.genre || null;
      renderMain();
      bindMainEvents();
    });
  });

  document.querySelectorAll('[data-play]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.play);
      const book = AUDIOBOOKS.find(a => a.id === id);
      if(!book) return;
      if(Player.book && Player.book.id === id){
        Player.toggle();
      } else {
        Player.start(book);
      }
      window.__expandedBook = id;
      renderMain();
      bindMainEvents();
    });
  });

  document.querySelectorAll('[data-toggle-chapters]').forEach(el => {
    el.addEventListener('click', () => {
      const id = Number(el.dataset.toggleChapters);
      window.__expandedBook = (window.__expandedBook === id) ? null : id;
      renderMain();
      bindMainEvents();
    });
  });

  document.querySelectorAll('[data-chapter-book]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.chapterBook);
      const index = Number(btn.dataset.chapterIndex);
      const book = AUDIOBOOKS.find(a => a.id === id);
      if(!book) return;
      if(Player.book && Player.book.id === id && Player.chapterIndex === index){
        Player.toggle();
      } else {
        Player.book = book;
        const saved = STORE.getBookProgress(id);
        const resume = (saved.chapter === index) ? saved.time : 0;
        Player.goToChapter(index, true, resume);
      }
      renderMain();
      bindMainEvents();
    });
  });
}

/* ============================================================
   بوت اپلیکیشن
   ============================================================ */
function boot(){
  document.getElementById('app').innerHTML = appShell();
  Player.init();
  Player.onTick = () => renderMiniPlayer();
  Player.onStateChange = () => { renderMiniPlayer(); refreshAudiobooksRowIfActive(); };
  Player.onError = () => showToast('فایل صوتی این فصل پیدا نشد');
  bindShellEvents();
  renderMain();
  bindMainEvents();
  renderMiniPlayer();
}
boot();

/* ============================================================
   PWA: Service Worker + Install Prompt
   ============================================================ */
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__deferredInstallPrompt = e;
  const btn = document.getElementById('installBtn');
  if(btn) btn.classList.add('show');
});

window.addEventListener('appinstalled', () => {
  window.__deferredInstallPrompt = null;
  const btn = document.getElementById('installBtn');
  if(btn) btn.classList.remove('show');
});

document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'hidden') Player.saveProgress();
});
window.addEventListener('beforeunload', () => Player.saveProgress());

})();
