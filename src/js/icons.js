/* کتاب‌باز — آیکن‌های SVG (inline، بدون کتابخانه‌ی خارجی) */
const ICONS = {
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0L12 6.9 9.7 4.6c-1.8-1.8-4.7-1.8-6.5 0-1.8 1.8-1.8 4.7 0 6.5L12 20.4l8.8-9.3c1.8-1.8 1.8-4.7 0-6.5Z" stroke-linejoin="round"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  telegram:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.5 2.7 11.9c-1 .4-1 1.8.1 2.1l4.4 1.4 1.7 5.4c.2.7 1 .9 1.6.4l2.5-2.1 4.6 3.4c.7.5 1.7.1 1.9-.7l3.5-15.6c.2-.9-.6-1.6-1.5-1.2Zm-3.2 3.3L9.4 14.1l-.3 3.1-1.3-4 11.4-7-1 1.6Z"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3" stroke-linecap="round"/></svg>',
  bookmark:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 3h12v18l-6-4.5L6 21z" stroke-linejoin="round"/></svg>',
  bookOpen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6c-1.8-1.4-4.6-1.9-7-.9v12.6c2.4-1 5.2-.5 7 .9 1.8-1.4 4.6-1.9 7-.9V5.1c-2.4-1-5.2-.5-7 .9Z" stroke-linejoin="round"/><path d="M12 6v12.6"/></svg>',
  headphones:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14v-2a8 8 0 0 1 16 0v2" stroke-linecap="round"/><rect x="2.5" y="14" width="4" height="6" rx="1.5"/><rect x="17.5" y="14" width="4" height="6" rx="1.5"/></svg>',
  mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke-linecap="round"/></svg>',
  sparkle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" stroke-linecap="round"/></svg>',
  user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-3.5 4-5 7-5s6 1.5 7 5" stroke-linecap="round"/></svg>',
  download:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v11m0 0-4-4m4 4 4-4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 19h14" stroke-linecap="round"/></svg>',
  back15:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 1 1 2.6 5.9" stroke-linecap="round"/><path d="M4 7v5h5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fwd15:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12a8 8 0 1 1-2.6-5.9" stroke-linecap="round"/><path d="M20 7v5h-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  close:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18" stroke-linecap="round"/></svg>',
  empty:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 6c-1.8-1.4-4.6-1.9-7-.9v12.6c2.4-1 5.2-.5 7 .9 1.8-1.4 4.6-1.9 7-.9V5.1c-2.4-1-5.2-.5-7 .9Z" stroke-linejoin="round"/></svg>',
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 5 8 12l7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h7l3 3v15H7z" stroke-linejoin="round"/><path d="M9 13h6M9 17h4" stroke-linecap="round"/></svg>'
};
