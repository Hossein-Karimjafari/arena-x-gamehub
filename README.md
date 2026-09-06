# 🎮 گیم‌نت آرنا ایکس | ARENA X Game Hub

وب‌سایت کامل و حرفه‌ای گیم‌نت با طراحی گیمینگ تاریک/نئونی، RTL فارسی، رزرو آنلاین، مسابقات، اشتراک و پنل مدیریت کامل.

## ⚙️ تکنولوژی

- **Next.js 14 (App Router)** + **TypeScript** + **Zod** (اعتبارسنجی)
- **Tailwind CSS** (Dark neon theme، کاملاً ریسپانسیو و RTL)
- **Prisma + SQLite** (برای تولید: PostgreSQL فقط با تغییر provider)
- **NextAuth v4** (Credentials، نقش‌ها: USER/OPERATOR/ADMIN + JWT با refresh خودکار از DB)
- فونت **Vazirmatn** (فارسی) و **Orbitron** (عنوان‌های گیمینگ)

## 🚀 اجرا

```bash
npm install
npx prisma db push
npm run db:seed     # داده‌های نمونه + اکانت ادمین
npm run dev         # http://localhost:3000
node scripts/test-api.cjs     # تست دود APIهای عمومی + CSRF + هدرها
node scripts/test-auth.cjs    # تست فلوهای لاگین‌شده (کیف پول، کنسل+refund، ادمین)
```

### حساب‌های نمونه (فقط توسعه!)

| نقش | ورود | رمز |
|---|---|---|
| ادمین | `admin@arenax.ir` | `admin1234` |
| کاربر عادی | `arash@example.com` | `123456` |
| اپراتور | `operator@arenax.ir` | `123456` |

> ⚠️ قبل از دیپلوی واقعی، رمزها را عوض کنید و `NEXTAUTH_SECRET` قوی بگذارید.

## 📄 صفحات

- `/` صفحه اصلی (هیرو، امکانات، بازی‌ها، مسابقات، وضعیت زنده، نظرات، گالری، CTA)
- `/games` + `/games/[slug]` — لیست بازی‌ها با فیلتر + جزئیات و دیدگاه (با تایید ادمین)
- `/booking` — رزرو آنلاین (دستگاه → تاریخ/ساعت → تخفیف → در محل/آنلاین/کیف پول)
- `/tournaments` + `/tournaments/[slug]` — مسابقات با کسر خودکار هزینه ثبت‌نام از کیف پول
- `/pricing` — پلن‌ها با خرید از کیف پول + شمارش ساعت‌های باقی‌مانده اشتراک
- `/login` `/register` `/forgot-password` `/reset-password` `/dashboard` `/dashboard/wallet`
- `/leaderboard` `/about` `/contact` `/blog` + `/blog/[slug]`
- `/admin/*` — آمار، رزروها، دستگاه‌ها، کاربران، بازی‌ها، مسابقات، پلن‌ها، بلاگ، تخفیف‌ها، **دیدگاه‌ها (تایید/رد)**، **پیام‌های تماس**، اطلاع‌رسانی
- SEO: متادیتا + JSON-LD (LocalBusiness / VideoGame / Event) + `sitemap.xml` + `robots.txt`

## 🔐 امنیت پیاده‌سازی‌شده

- JWT: whitelist در `update` (جعل role/balance غیرممکن) + refresh خودکار از DB هر ۶۰ ثانیه
- همه ورودی‌ها با **Zod** اعتبارسنجی می‌شوند (تاریخ، موبایل، مبلغ، طول متن و…)
- **Transaction اتمیک** برای رزرو (جلوگیری از رزرو دوبله)، تخفیف (`used < maxUse`)، ظرفیت مسابقه و کیف پول (جلوگیری از دوبار خرج‌کردن)
- **Rate limit** روی login/register/booking/contact/reviews/topup
- **CSRF**: بررسی Origin در middleware برای متدهای تغییردهنده
- هدرهای امنیتی (HSTS، X-Frame-Options، nosniff و…)
- تفکیک نقش: حذف و تغییر نقش فقط `ADMIN`؛ اپراتور فقط مدیریت محتوا
- Mass-assignment بسته: whitelist فیلدها در همه PATCHهای ادمین
- hash غیرهمزمان bcrypt + نرمال‌سازی ایمیل/یوزرنیم (case-insensitive)
- فراموشی رمز با توکن ۳۰ دقیقه‌ای + بدون افشای وجود ایمیل

## 💳 پرداخت

- با `ZARINPAL_MERCHANT_ID` خالی: **شبیه‌ساز درگاه** در `/pay/simulate` — کل فلو (PENDING → verify → SUCCESS/FAILED) مثل درگاه واقعی است.
- با تنظیم `ZARINPAL_MERCHANT_ID`: درخواست/تایید واقعی زرین‌پال روی `/api/wallet/verify` (callback مشترک شارژ کیف پول و پرداخت رزرو).

## 🧩 نکات توسعه

- مهاجرت به PostgreSQL فقط با تغییر `datasource` در `prisma/schema.prisma` (SQLite enum ندارد؛ مقادیر role/status در لایه اپلیکیشن با zod کنترل می‌شوند).
- پیامک/ایمیل به‌صورت اعلان درون‌برنامه‌ای ثبت می‌شود؛ اتصال Kavenegar/SMS.ir به `/api/auth/forgot` و `api/booking` قابل افزودن است.
- نام/آدرس/تلفن سایت از `src/lib/constants.ts` و `.env` قابل تغییر است.
- Rate limiter درون‌حافظه‌ای است؛ برای چند instance از Redis/Upstash استفاده کنید.
