/* کتاب‌باز — پلیر کتاب صوتی واقعی (تگ audio + فصل‌بندی)
   این فایل مستقل از صفحه است؛ هر صفحه (خانه یا صفحه‌ی اختصاصی کتاب) با
   تنظیم Player.onChange یک تابع رندر دلخواه خودش را وصل می‌کند. */
const Player = {
  audioEl:null,
  book:null,
  chapterIndex:0,
  scrubbing:false,
  playing:false,
  onChange:null, // سازگاری قدیمی: اگر تنظیم شود برای هر دو رویداد زیر صدا زده می‌شود
  onTick:null,   // رویداد پرتکرار timeupdate — فقط برای آپدیت نوار پیشرفت
  onStateChange:null, // play/pause/ended/loadedmetadata — برای رفرش کامل UI

  init(){
    if(this.audioEl) return; // فقط یک‌بار
    this.audioEl = document.createElement('audio');
    this.audioEl.preload = 'metadata';
    this.audioEl.style.display = 'none';
    document.body.appendChild(this.audioEl);

    const fireTick = () => {
      if(typeof this.onTick === 'function') this.onTick();
      if(typeof this.onChange === 'function') this.onChange();
    };
    const fireState = () => {
      if(typeof this.onStateChange === 'function') this.onStateChange();
      if(typeof this.onChange === 'function') this.onChange();
    };

    this.audioEl.addEventListener('play', () => { this.playing = true; fireState(); });
    this.audioEl.addEventListener('pause', () => { this.playing = false; fireState(); });
    this.audioEl.addEventListener('timeupdate', () => {
      if(this.scrubbing) return;
      this.saveProgress();
      fireTick();
    });
    this.audioEl.addEventListener('loadedmetadata', fireState);
    this.audioEl.addEventListener('ended', () => { this.goToChapter(this.chapterIndex + 1, true); fireState(); });
    this.audioEl.addEventListener('error', () => {
      if(typeof this.onError === 'function') this.onError();
    });
  },

  /* شروع پخش یک کتاب از فصل و زمانی که قبلاً ذخیره شده، یا از ابتدا */
  start(book){
    const saved = STORE.getBookProgress(book.id);
    this.book = book;
    this.goToChapter(saved.chapter || 0, true, saved.time || 0);
  },

  goToChapter(index, autoplay, resumeTime){
    if(!this.book) return;
    if(index < 0) index = 0;
    if(index >= this.book.chapters.length){
      this.close();
      return;
    }
    this.chapterIndex = index;
    const ch = this.book.chapters[index];
    this.audioEl.src = '/' + String(ch.file).replace(/^\/+/, '');
    const onReady = () => {
      if(resumeTime) this.audioEl.currentTime = resumeTime;
      if(autoplay) this.audioEl.play().catch(() => {});
      this.audioEl.removeEventListener('loadedmetadata', onReady);
    };
    this.audioEl.addEventListener('loadedmetadata', onReady);
    this.audioEl.load();
    if(typeof this.onStateChange === 'function') this.onStateChange();
    if(typeof this.onChange === 'function') this.onChange();
  },

  toggle(){
    if(!this.audioEl || !this.book) return;
    if(this.audioEl.paused) this.audioEl.play().catch(() => {});
    else this.audioEl.pause();
  },
  nextChapter(){ this.goToChapter(this.chapterIndex + 1, true); },
  prevChapter(){ this.goToChapter(this.chapterIndex - 1, true); },
  seekBy(delta){
    if(!this.audioEl || !this.book) return;
    const d = this.audioEl.duration || 0;
    this.audioEl.currentTime = Math.min(d, Math.max(0, this.audioEl.currentTime + delta));
  },
  seekTo(seconds){
    if(!this.audioEl || !this.book) return;
    const d = this.audioEl.duration || 0;
    this.audioEl.currentTime = Math.min(d, Math.max(0, seconds));
  },
  saveProgress(){
    if(this.book) STORE.setBookProgress(this.book.id, this.chapterIndex, this.audioEl.currentTime || 0);
  },
  close(){
    if(this.audioEl){ this.saveProgress(); this.audioEl.pause(); }
    this.book = null;
    this.playing = false;
    if(typeof this.onStateChange === 'function') this.onStateChange();
    if(typeof this.onChange === 'function') this.onChange();
  }
};
