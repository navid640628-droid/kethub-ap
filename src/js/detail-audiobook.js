/* کتاب‌باز — اسکریپت صفحه‌ی اختصاصی هر کتاب صوتی (فصل‌ها + پلیر مینی) */
(function(){
"use strict";

const book = window.__BOOK__;
if(!book) return;

function fmtTime(sec){
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec/3600), m = Math.floor((sec%3600)/60), s = sec%60;
  const mm = String(m).padStart(2,'0'), ss = String(s).padStart(2,'0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
}

let toastTimer = null;
function showToast(msg){
  const t = document.getElementById('toast');
  const inner = document.getElementById('toastInner');
  if(!t || !inner) return;
  inner.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* --- دکمه‌ی علاقه‌مندی --- */
const favBtn = document.getElementById('favBtn');
if(favBtn){
  const id = Number(favBtn.dataset.fav);
  const label = document.getElementById('favLabel');
  function refreshFav(){
    const isFav = STORE.isFav(id);
    if(label) label.textContent = isFav ? 'در علاقه‌مندی‌هاست ✓' : 'افزودن به علاقه‌مندی‌ها';
  }
  favBtn.addEventListener('click', () => {
    const nowFav = STORE.toggleFav(id);
    showToast(nowFav ? 'به علاقه‌مندی‌ها افزوده شد' : 'از علاقه‌مندی‌ها حذف شد');
    refreshFav();
  });
  refreshFav();
}

/* --- فهرست فصل‌ها --- */
function renderChapterStates(){
  document.querySelectorAll('.chapter-row').forEach(btn => {
    const i = Number(btn.dataset.chapterIndex);
    const isActive = Player.book && Player.chapterIndex === i;
    btn.classList.toggle('active', !!isActive);
    const dot = btn.querySelector('.chapter-dot');
    if(dot) dot.innerHTML = (isActive && Player.playing) ? ICONS.pause : ICONS.play;
  });
}

document.querySelectorAll('.chapter-row').forEach(btn => {
  btn.addEventListener('click', () => {
    const index = Number(btn.dataset.chapterIndex);
    if(Player.book && Player.chapterIndex === index){
      Player.toggle();
    } else {
      Player.book = book;
      const saved = STORE.getBookProgress(book.id);
      const resume = (saved.chapter === index) ? saved.time : 0;
      Player.goToChapter(index, true, resume);
    }
  });
});

/* --- پلیر مینی --- */
function renderMiniPlayer(){
  const el = document.getElementById('miniPlayer');
  if(!el) return;
  if(!Player.book || Player.book.id !== book.id){
    el.classList.remove('show');
    el.innerHTML = '';
    return;
  }
  const ch = book.chapters[Player.chapterIndex];
  const duration = Player.audioEl.duration || 0;
  const elapsed = Player.audioEl.currentTime || 0;
  const pct = duration > 0 ? Math.min(100, Math.round((elapsed/duration)*100)) : 0;
  el.classList.add('show');
  el.innerHTML = `
    <div class="mini-cover">${book.glyph}</div>
    <div class="mini-info">
      <p>${book.title} · ${ch.title}</p>
      <span class="mini-time" id="mpTime">${fmtTime(elapsed)} / ${duration ? fmtTime(duration) : '…'}</span>
      <div class="seek-wrap" id="seekWrap">
        <div class="mini-progress"><div id="seekFill" style="width:${pct}%"><span class="seek-thumb"></span></div></div>
      </div>
    </div>
    <button class="mini-btn" id="mpBack" aria-label="۱۵ ثانیه عقب">${ICONS.back15}</button>
    <button class="mini-btn" id="mpToggle" aria-label="پخش/توقف">${Player.playing ? ICONS.pause : ICONS.play}</button>
    <button class="mini-btn" id="mpFwd" aria-label="۱۵ ثانیه جلو">${ICONS.fwd15}</button>
    <button class="mini-btn close" id="mpClose" aria-label="بستن">${ICONS.close}</button>
  `;
  document.getElementById('mpToggle').onclick = () => Player.toggle();
  document.getElementById('mpBack').onclick = () => Player.seekBy(-15);
  document.getElementById('mpFwd').onclick = () => Player.seekBy(15);
  document.getElementById('mpClose').onclick = () => Player.close();
  bindSeekDrag(document.getElementById('seekWrap'));
}

function fractionFromClientX(wrap, clientX){
  const rect = wrap.getBoundingClientRect();
  return Math.min(1, Math.max(0, (rect.right - clientX) / rect.width));
}
function applySeekVisual(fraction){
  const fill = document.getElementById('seekFill');
  const timeEl = document.getElementById('mpTime');
  const duration = Player.audioEl ? (Player.audioEl.duration || 0) : 0;
  if(!fill || !duration) return 0;
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
    applySeekVisual(lastFraction);
  }
  function onUp(){
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
    if(!Player.audioEl.duration) return;
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

Player.init();
Player.onTick = renderMiniPlayer;
Player.onStateChange = () => { renderMiniPlayer(); renderChapterStates(); };
Player.onError = () => showToast('فایل صوتی این فصل پیدا نشد');
renderChapterStates();

})();
