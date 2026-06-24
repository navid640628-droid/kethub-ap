/* ============================================================
   کتاب‌باز — build.js
   این اسکریپت محتوای JSON داخل content/ را می‌خواند و یک سایت استاتیک
   کامل در dist/ می‌سازد: صفحه‌ی اصلی، یک صفحه‌ی مستقل برای هر کتاب
   (برای دانلود PDF و سئو)، یک صفحه‌ی مستقل برای هر کتاب صوتی،
   sitemap.xml، robots.txt و manifest.json.

   اجرا: node build.js
   Cloudflare Pages این فایل را خودش با هر push روی گیت‌هاب اجرا می‌کند؛
   نیازی به نصب چیزی نیست (هیچ پکیج خارجی استفاده نشده).
   ============================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const SRC_DIR = path.join(ROOT, 'src');
const FILES_DIR = path.join(ROOT, 'files');
const DIST_DIR = path.join(ROOT, 'dist');

/* ------------------------------------------------------------
   ابزارهای فایل
   ------------------------------------------------------------ */
function readJSON(file){
  const full = path.join(CONTENT_DIR, file);
  if(!fs.existsSync(full)){
    console.warn(`⚠️  فایل محتوا پیدا نشد، رد شد: content/${file}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(full, 'utf8'));
}

function ensureDir(dir){ fs.mkdirSync(dir, {recursive:true}); }

function copyFileEnsured(src, dest){
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDirRecursive(srcDir, destDir){
  if(!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  for(const entry of fs.readdirSync(srcDir, {withFileTypes:true})){
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if(entry.isDirectory()) copyDirRecursive(srcPath, destPath);
    else copyFileEnsured(srcPath, destPath);
  }
}

function removeDirRecursive(dir){
  if(fs.existsSync(dir)) fs.rmSync(dir, {recursive:true, force:true});
}

function fileToBase64(file){
  return fs.readFileSync(file).toString('base64');
}

/* جایگزینی {{KEY}} با مقدار، بدون هیچ کتابخانه‌ی قالب‌سازی */
function render(template, vars){
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return (key in vars) ? String(vars[key]) : '';
  });
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ------------------------------------------------------------
   رنگ‌بندی کارت‌ها (همان منطق سمت کلاینت، برای تولید style در سرور)
   ------------------------------------------------------------ */
const PALETTES = [
  ["#2D6A4F","#0F2D22"], ["#7A6B2F","#3A3010"], ["#1B4332","#0A1F16"],
  ["#A8542E","#5C2A14"], ["#3D6A92","#16334A"], ["#6B3F6E","#2E1A30"],
  ["#52796F","#1E3A30"], ["#9A6B2E","#4A330F"]
];
function paletteFor(id){ return PALETTES[id % PALETTES.length]; }

/* ------------------------------------------------------------
   ۱) خواندن محتوا
   ------------------------------------------------------------ */
const SITE = readJSON('site.json');
const books = readJSON('books.json');
const audiobooks = readJSON('audiobooks.json');
const podcasts = readJSON('podcasts.json');
const facts = readJSON('facts.json');
const authors = readJSON('authors.json');

const DATA = { books, audiobooks, podcasts, facts, authors, site: SITE };
const DOMAIN = (SITE.domain || '').replace(/\/$/, '');

/* بررسی فایل‌های گم‌شده — فقط هشدار، بیلد را متوقف نمی‌کند */
for(const b of books){
  if(b.pdf && !fs.existsSync(path.join(ROOT, b.pdf))){
    console.warn(`⚠️  فایل PDF کتاب «${b.title}» پیدا نشد: ${b.pdf}`);
  }
}
for(const a of audiobooks){
  for(const ch of (a.chapters || [])){
    if(!fs.existsSync(path.join(ROOT, ch.file))){
      console.warn(`⚠️  فایل صوتی «${a.title} / ${ch.title}» پیدا نشد: ${ch.file}`);
    }
  }
}

/* ------------------------------------------------------------
   ۲) آیکن‌ها (base64) — یک‌بار خوانده می‌شوند
   ------------------------------------------------------------ */
const ICONS_DIR = path.join(SRC_DIR, 'icons');
const ICON_512_B64 = fileToBase64(path.join(ICONS_DIR, 'icon-512.png'));
const ICON_192_B64 = fileToBase64(path.join(ICONS_DIR, 'icon-192.png'));
const ICON_MASKABLE_B64 = fileToBase64(path.join(ICONS_DIR, 'icon-maskable-512.png'));
const APPLE_ICON_B64 = fileToBase64(path.join(ICONS_DIR, 'apple-touch-icon.png'));
const FAVICON_B64 = fileToBase64(path.join(ICONS_DIR, 'favicon-32.png'));

/* SVG های کوچک مورد نیاز در سمت سرور (دکمه‌ی بازگشت، PDF، قلب، تلگرام) */
const SVG = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:15px;height:15px;display:inline;vertical-align:middle"><path d="M15 5 8 12l7 7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pdf:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h7l3 3v15H7z" stroke-linejoin="round"/><path d="M9 13h6M9 17h4" stroke-linecap="round"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6c-1.8-1.8-4.7-1.8-6.5 0L12 6.9 9.7 4.6c-1.8-1.8-4.7-1.8-6.5 0-1.8 1.8-1.8 4.7 0 6.5L12 20.4l8.8-9.3c1.8-1.8 1.8-4.7 0-6.5Z" stroke-linejoin="round"/></svg>',
  telegram:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.5 4.5 2.7 11.9c-1 .4-1 1.8.1 2.1l4.4 1.4 1.7 5.4c.2.7 1 .9 1.6.4l2.5-2.1 4.6 3.4c.7.5 1.7.1 1.9-.7l3.5-15.6c.2-.9-.6-1.6-1.5-1.2Zm-3.2 3.3L9.4 14.1l-.3 3.1-1.3-4 11.4-7-1 1.6Z"/></svg>',
  play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
};

/* ------------------------------------------------------------
   ۳) پاک‌سازی و آماده‌سازی dist/
   ------------------------------------------------------------ */
removeDirRecursive(DIST_DIR);
ensureDir(DIST_DIR);

/* کپی دارایی‌های استاتیک */
copyDirRecursive(path.join(SRC_DIR, 'css'), path.join(DIST_DIR, 'css'));
copyDirRecursive(path.join(SRC_DIR, 'js'), path.join(DIST_DIR, 'js'));
copyDirRecursive(FILES_DIR, path.join(DIST_DIR, 'files'));

/* ------------------------------------------------------------
   ۴) صفحه‌ی اصلی
   ------------------------------------------------------------ */
const shellTpl = fs.readFileSync(path.join(SRC_DIR, 'templates', 'shell.html'), 'utf8');

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": SITE.siteName,
  "url": DOMAIN + '/',
  "description": SITE.defaultDescription,
  "inLanguage": SITE.lang || 'fa'
};

const homeHtml = render(shellTpl, {
  SITE_NAME: escapeHtml(SITE.siteName),
  SITE_DESCRIPTION: escapeHtml(SITE.defaultDescription),
  DOMAIN: DOMAIN,
  THEME_COLOR: SITE.themeColor,
  LOCALE: SITE.locale || 'fa_IR',
  APPLE_ICON_B64,
  FAVICON_B64,
  WEBSITE_JSONLD: JSON.stringify(websiteJsonLd, null, 2),
  DATA_JSON: JSON.stringify(DATA)
});
fs.writeFileSync(path.join(DIST_DIR, 'index.html'), homeHtml);

/* ------------------------------------------------------------
   ۵) صفحه‌ی اختصاصی هر کتاب (PDF)
   ------------------------------------------------------------ */
const bookTpl = fs.readFileSync(path.join(SRC_DIR, 'templates', 'book.html'), 'utf8');

function relatedBlock(items, baseUrlPrefix, currentId, titleKey){
  const others = items.filter(i => i.id !== currentId).slice(0, 6);
  if(others.length === 0) return '';
  const cards = others.map(o => {
    const [c1, c2] = paletteFor(o.id);
    return `
      <a class="related-card" href="/${baseUrlPrefix}/${o.slug}/">
        <div class="related-cover" style="--c1:${c1};--c2:${c2}">${o.glyph}</div>
        <p class="related-title">${escapeHtml(o[titleKey])}</p>
      </a>`;
  }).join('');
  return `
    <div class="related-strip">
      <p class="detail-section-label">بیشتر بخوانید</p>
      <div class="related-scroll">${cards}</div>
    </div>`;
}

for(const b of books){
  const [c1, c2] = paletteFor(b.id);
  const canonical = `${DOMAIN}/books/${b.slug}/`;

  const bookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": b.title,
    "author": { "@type": "Person", "name": b.author },
    "genre": b.genre,
    "description": b.description,
    "url": canonical,
    "inLanguage": "fa",
    "isPartOf": { "@type": "WebSite", "name": SITE.siteName, "url": DOMAIN + '/' }
  };

  const html = render(bookTpl, {
    TITLE: escapeHtml(b.title),
    AUTHOR: escapeHtml(b.author),
    GENRE: escapeHtml(b.genre),
    DESCRIPTION: escapeHtml(b.description || ''),
    GLYPH: escapeHtml(b.glyph),
    PDF_PATH: b.pdf,
    FILE_SIZE: b.fileSizeMB || '?',
    BOOK_ID: b.id,
    CANONICAL_URL: canonical,
    THEME_COLOR: SITE.themeColor,
    LOCALE: SITE.locale || 'fa_IR',
    SITE_NAME: escapeHtml(SITE.siteName),
    TELEGRAM_URL: SITE.telegramUrl,
    APPLE_ICON_B64,
    FAVICON_B64,
    COLOR1: c1,
    COLOR2: c2,
    ICON_BACK: SVG.back,
    ICON_PDF: SVG.pdf,
    ICON_HEART: SVG.heart,
    ICON_TELEGRAM: SVG.telegram,
    BOOK_JSONLD: JSON.stringify(bookJsonLd, null, 2),
    RELATED_BOOKS_BLOCK: relatedBlock(books, 'books', b.id, 'title')
  });

  const bookOutPath = path.join(DIST_DIR, 'books', b.slug, 'index.html');
  ensureDir(path.dirname(bookOutPath));
  fs.writeFileSync(bookOutPath, html);
}
console.log(`✓ ${books.length} صفحه‌ی کتاب ساخته شد`);

/* ------------------------------------------------------------
   ۶) صفحه‌ی اختصاصی هر کتاب صوتی
   ------------------------------------------------------------ */
const audiobookTpl = fs.readFileSync(path.join(SRC_DIR, 'templates', 'audiobook.html'), 'utf8');

for(const a of audiobooks){
  const [c1, c2] = paletteFor(a.id);
  const canonical = `${DOMAIN}/audiobooks/${a.slug}/`;

  const chaptersHtml = a.chapters.map((ch, i) => `
    <button class="chapter-row" data-chapter-index="${i}">
      <span class="chapter-dot">${SVG.play}</span>
      <span>${escapeHtml(ch.title)}</span>
    </button>`).join('');

  const audiobookJsonLd = {
    "@context": "https://schema.org",
    "@type": "Audiobook",
    "name": a.title,
    "author": { "@type": "Person", "name": a.author },
    "description": a.description,
    "url": canonical,
    "inLanguage": "fa",
    "isPartOf": { "@type": "WebSite", "name": SITE.siteName, "url": DOMAIN + '/' }
  };

  const html = render(audiobookTpl, {
    TITLE: escapeHtml(a.title),
    AUTHOR: escapeHtml(a.author),
    DESCRIPTION: escapeHtml(a.description || ''),
    GLYPH: escapeHtml(a.glyph),
    CHAPTER_COUNT: a.chapters.length,
    BOOK_ID: a.id,
    CANONICAL_URL: canonical,
    THEME_COLOR: SITE.themeColor,
    LOCALE: SITE.locale || 'fa_IR',
    SITE_NAME: escapeHtml(SITE.siteName),
    TELEGRAM_URL: SITE.telegramUrl,
    APPLE_ICON_B64,
    FAVICON_B64,
    COLOR1: c1,
    COLOR2: c2,
    ICON_BACK: SVG.back,
    ICON_HEART: SVG.heart,
    ICON_TELEGRAM: SVG.telegram,
    CHAPTERS_HTML: chaptersHtml,
    AUDIOBOOK_JSONLD: JSON.stringify(audiobookJsonLd, null, 2),
    BOOK_JSON: JSON.stringify(a),
    RELATED_AUDIOBOOKS_BLOCK: relatedBlock(audiobooks, 'audiobooks', a.id, 'title')
  });

  const audiobookOutPath = path.join(DIST_DIR, 'audiobooks', a.slug, 'index.html');
  ensureDir(path.dirname(audiobookOutPath));
  fs.writeFileSync(audiobookOutPath, html);
}
console.log(`✓ ${audiobooks.length} صفحه‌ی کتاب صوتی ساخته شد`);

/* ------------------------------------------------------------
   ۷) manifest.json
   ------------------------------------------------------------ */
const manifest = {
  name: SITE.siteName,
  short_name: SITE.siteName,
  description: SITE.defaultDescription,
  start_url: '/?source=pwa',
  id: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  lang: SITE.lang || 'fa',
  dir: 'rtl',
  background_color: SITE.backgroundColor,
  theme_color: SITE.themeColor,
  categories: ['books', 'entertainment', 'education'],
  icons: [
    { src: `data:image/png;base64,${ICON_192_B64}`, sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: `data:image/png;base64,${ICON_512_B64}`, sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: `data:image/png;base64,${ICON_MASKABLE_B64}`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ],
  shortcuts: [
    { name: 'ادامه کتاب صوتی', url: '/?tab=audiobooks', description: 'بازگشت به پلیر کتاب صوتی' },
    { name: 'علاقه‌مندی‌ها', url: '/?tab=books&filter=fav', description: 'مشاهده کتاب‌های نشان‌شده' }
  ]
};
fs.writeFileSync(path.join(DIST_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

/* ------------------------------------------------------------
   ۸) sw.js — کپی مستقیم (نیازی به قالب‌سازی ندارد)
   ------------------------------------------------------------ */
copyFileEnsured(path.join(SRC_DIR, 'sw.js'), path.join(DIST_DIR, 'sw.js'));

/* ------------------------------------------------------------
   ۹) sitemap.xml + robots.txt
   ------------------------------------------------------------ */
function isoDate(d){
  try{ return new Date(d).toISOString().slice(0,10); }
  catch(e){ return new Date().toISOString().slice(0,10); }
}

const urls = [
  { loc: `${DOMAIN}/`, lastmod: isoDate(Date.now()), priority: '1.0' },
  ...books.map(b => ({ loc: `${DOMAIN}/books/${b.slug}/`, lastmod: isoDate(b.addedDate), priority: '0.8' })),
  ...audiobooks.map(a => ({ loc: `${DOMAIN}/audiobooks/${a.slug}/`, lastmod: isoDate(a.addedDate), priority: '0.8' }))
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapXml);

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;
fs.writeFileSync(path.join(DIST_DIR, 'robots.txt'), robotsTxt);

console.log('✓ sitemap.xml و robots.txt ساخته شد');
console.log(`✓ بیلد کامل شد → ${path.relative(ROOT, DIST_DIR)}/`);
