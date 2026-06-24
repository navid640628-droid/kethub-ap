/* کتاب‌باز — اسکریپت سبک صفحه‌ی اختصاصی هر کتاب (فقط دکمه‌ی علاقه‌مندی) */
(function(){
"use strict";

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

const favBtn = document.getElementById('favBtn');
if(favBtn){
  const id = Number(favBtn.dataset.fav);
  const label = document.getElementById('favLabel');
  function refresh(){
    const isFav = STORE.isFav(id);
    favBtn.classList.toggle('cta-secondary', !isFav);
    if(label) label.textContent = isFav ? 'در علاقه‌مندی‌هاست ✓' : 'افزودن به علاقه‌مندی‌ها';
  }
  favBtn.addEventListener('click', () => {
    const nowFav = STORE.toggleFav(id);
    showToast(nowFav ? 'به علاقه‌مندی‌ها افزوده شد' : 'از علاقه‌مندی‌ها حذف شد');
    refresh();
  });
  refresh();
}

})();
