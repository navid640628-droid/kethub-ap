/* کتاب‌باز — ذخیره‌سازی محلی (localStorage). هیچ سرور یا دیتابیسی در کار نیست. */
const STORE = {
  get userId(){
    let id = localStorage.getItem('kb_userId');
    if(!id){
      id = 'kb_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2,10);
      localStorage.setItem('kb_userId', id);
    }
    return id;
  },
  getFavorites(){
    try{ return JSON.parse(localStorage.getItem('kb_favorites')) || []; }catch(e){ return []; }
  },
  saveFavorites(arr){ localStorage.setItem('kb_favorites', JSON.stringify(arr)); },
  isFav(id){ return this.getFavorites().includes(id); },
  toggleFav(id){
    let favs = this.getFavorites();
    if(favs.includes(id)) favs = favs.filter(f => f !== id);
    else favs.push(id);
    this.saveFavorites(favs);
    return favs.includes(id);
  },
  getProgress(){
    try{ return JSON.parse(localStorage.getItem('kb_progress')) || {}; }catch(e){ return {}; }
  },
  /* پیشرفت هر کتاب صوتی به شکل {chapter, time} ذخیره می‌شود */
  getBookProgress(bookId){
    const p = this.getProgress();
    return p[bookId] || {chapter:0, time:0};
  },
  setBookProgress(bookId, chapter, time){
    const p = this.getProgress();
    p[bookId] = {chapter, time};
    localStorage.setItem('kb_progress', JSON.stringify(p));
  },
  getLastTab(){ return localStorage.getItem('kb_last_tab') || 'books'; },
  setLastTab(tab){ localStorage.setItem('kb_last_tab', tab); }
};
STORE.userId; // اطمینان از ساخت شناسه در اولین بار اجرا
