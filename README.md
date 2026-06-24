# کتاب‌باز (kethub-app)

اپلیکیشن وب کتاب‌باز — کتاب (PDF)، کتاب صوتی (MP3 فصل‌به‌فصل)، پادکست و حاشیه‌های ادبی.
محتوا کاملاً با فایل‌های JSON مدیریت می‌شود؛ نیازی به دست‌زدن به کد نیست.

## ساختار پوشه‌ها

```
content/            ← همه‌چیز که هر روز ویرایش می‌کنی اینجاست
  site.json         ← تنظیمات کلی سایت (نام، دامین، رنگ، لینک تلگرام)
  books.json        ← فهرست کتاب‌های PDF
  audiobooks.json   ← فهرست کتاب‌های صوتی (فصل‌به‌فصل)
  podcasts.json     ← فهرست پادکست‌ها
  facts.json        ← حاشیه‌ها و حقایق کتاب
  authors.json      ← مشاهیر و نویسندگان

files/              ← خود فایل‌های واقعی
  books/<id>/book.pdf
  audio/<id>/ch1.mp3, ch2.mp3, ...

src/                ← کد و قالب‌ها (به‌ندرت لازم است دست بخورد)
  css/app.css
  js/...
  templates/...
  icons/...

build.js            ← اسکریپتی که از روی content/ یک سایت کامل می‌سازد
dist/               ← خروجی نهایی (Cloudflare Pages خودش می‌سازد، در گیت‌هاب نیست)
```

## هر روز چطور یک کتاب جدید (PDF) اضافه کنم؟

۱. فایل PDF و عکس جلد را در گیت‌هاب آپلود کن:
   - یک عدد شناسه‌ی جدید انتخاب کن (مثلاً ۱۱، اگر تا حالا تا ۱۰ استفاده شده)
   - **Add file → Create new file** → اسم بنویس: `files/books/11/keep.txt` → هر متنی → Commit (این پوشه را می‌سازد)
   - برو توی پوشه‌ی `files/books/11` → **Add file → Upload files** → هر دو فایل را بکش و رها کن:
     - فایل PDF را با اسم `book.pdf`
     - عکس جلد را با اسم `cover.jpg` (یا `cover.png`)
   - Commit

۲. به `content/books.json` یک آیتم اضافه کن:
```json
{
  "id": 11,
  "slug": "esm-ketab-be-english",
  "title": "عنوان کتاب",
  "author": "نام نویسنده",
  "genre": "ادبیات فارسی",
  "glyph": "ع",
  "description": "یک توضیح کوتاه و واقعی درباره‌ی کتاب.",
  "pdf": "files/books/11/book.pdf",
  "cover": "files/books/11/cover.jpg",
  "fileSizeMB": 4,
  "addedDate": "2025-10-01"
}
```
نکات:
- `slug` فقط حروف انگلیسی کوچک و خط‌فاصله — همین در آدرس سایت دیده می‌شود: `ketHub.ir/books/esm-ketab-be-english/`
- `cover` اختیاری است — اگر اضافه‌اش نکنی، کارت کتاب همان نشان رنگی حرف اول (`glyph`) را نشان می‌دهد، مثل قبل
- بهترین نسبت برای عکس جلد، عمودی (مثلاً ۶۰۰×۹۰۰ یا هر نسبت کتاب‌مانند) است؛ عکس‌های خیلی بزرگ (بیشتر از ۵۰۰ کیلوبایت) را قبل از آپلود کوچک کن تا سایت سریع بماند
- `glyph` یک حرف/نماد که وقتی عکس جلد نیست، روی جلد رنگی نشان داده می‌شود
- `id` باید با هیچ کتاب دیگری یکی نباشد

۳. Commit کن. همین — Cloudflare خودش صفحه‌ی اختصاصی، سئو، و sitemap را می‌سازد. عکس جلد هم در کارت صفحه‌ی اصلی و هم بالای صفحه‌ی اختصاصی کتاب نشان داده می‌شود.

## به کتاب‌های قبلی هم می‌توانم بعداً عکس جلد اضافه کنم؟

بله — فقط عکس را در `files/books/<id>/cover.jpg` آپلود کن و خط `"cover": "files/books/<id>/cover.jpg"` را به همان آیتم در `content/books.json` اضافه کن، بعد Commit بزن.

## هر روز چطور یک کتاب صوتی جدید اضافه کنم؟

۱. هر فصل را جدا mp3 کن (هر فایل ترجیحاً زیر ۲۰-۲۵ مگابایت)
۲. مثل بالا یک پوشه بساز: `files/audio/<id>/ch1.mp3`, `ch2.mp3`, ...
۳. به `content/audiobooks.json` اضافه کن:
```json
{
  "id": 105,
  "slug": "esm-ketab-sedaa",
  "title": "عنوان کتاب",
  "author": "نام نویسنده",
  "glyph": "ع",
  "description": "توضیح کوتاه.",
  "addedDate": "2025-10-01",
  "chapters": [
    {"title": "فصل ۱", "file": "files/audio/105/ch1.mp3"},
    {"title": "فصل ۲", "file": "files/audio/105/ch2.mp3"}
  ]
}
```

## پادکست / حاشیه / نویسنده اضافه کردن

فقط یک آیتم جدید به `content/podcasts.json`، `content/facts.json` یا `content/authors.json` اضافه کن — این‌ها فایل ندارند، فقط متن.

## تنظیمات Cloudflare Pages (یک‌بار، موقع راه‌اندازی)

در پروژه‌ی Pages → Settings → Builds & deployments:
- **Build command:** `node build.js`
- **Build output directory:** `dist`

از این به بعد با هر Commit در گیت‌هاب، سایت خودش دوباره ساخته و منتشر می‌شود.

## تست محلی (اختیاری، اگر Node نصب باشد)

```
node build.js
```
خروجی در پوشه‌ی `dist/` ساخته می‌شود. اگر فایلی (PDF یا mp3) پیدا نشود، فقط یک هشدار در ترمینال چاپ می‌شود و بیلد متوقف نمی‌شود.

## سئو

- هر کتاب و هر کتاب صوتی یک آدرس و صفحه‌ی مستقل دارد (`/books/<slug>/`, `/audiobooks/<slug>/`) با عنوان، توضیح، تگ‌های Open Graph و JSON-LD مخصوص خودش.
- `sitemap.xml` و `robots.txt` خودکار ساخته می‌شوند.
- بعد از اولین انتشار، در Google Search Console نقشه‌ی سایت را دوباره ثبت کن: `https://ketHub.ir/sitemap.xml`
