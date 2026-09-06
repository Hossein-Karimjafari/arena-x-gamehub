import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const G = [
  { slug: "fifa-24", title: "ای‌اِی اسپورتس فیفا ۲۴", titleEn: "EA FC 24", genre: "ورزشی", platform: "PS5", emoji: "⚽", gradient: "green", rating: 4.7, multiplayer: true, players: "۱ تا ۴", popular: true, pricePerHour: 180000, description: "جدیدترین نسخه فیفا با موتور HyperMotion و لیگ‌های به‌روز. تورنمنت‌های هفتگی فیفا آرنا ایکس هر پنجشنبه با جوایز نقدی برگزار می‌شود.", sysreq: "کنسول PS5 | دسته DualSense | تلویزیون ۴K ۵۵ اینچ" },
  { slug: "cod-warzone", title: "کالاف دیوتی: وارزون", titleEn: "Call of Duty: Warzone", genre: "شوتر", platform: "PC", emoji: "🎯", gradient: "orange", rating: 4.6, multiplayer: true, players: "۱ تا ۴", popular: true, pricePerHour: 150000, description: "بتل‌رویال پرآدرنالین با نقشه‌های بزرگ و مبارزه تیمی. با سیستم‌های RTX 4070 و مانیتور ۲۴۰ هرتز، هیچ فریمی از دستت درنمی‌رود.", sysreq: "RTX 4070 | Ryzen 7 7800X3D | RAM 32GB | مانیتور ۲۴۰Hz" },
  { slug: "valorant", title: "ولورنت", titleEn: "VALORANT", genre: "شوتر تاکتیکی", platform: "PC", emoji: "🔫", gradient: "pink", rating: 4.8, multiplayer: true, players: "۵ نفره تیمی", popular: true, pricePerHour: 150000, description: "شوتر تاکتیکی ریوت با ترکیب توانایی‌های عامل‌ها. اتاق تیمی اختصاصی ما برای اسکریم تیم‌های رنک‌بالای ولورنت آماده است.", sysreq: "RTX 4070 | مانیتور ۲۴۰Hz | صندلی گیمینگ | هدفون HyperX" },
  { slug: "dota-2", title: "دوتا ۲", titleEn: "DOTA 2", genre: "موبا", platform: "PC", emoji: "🛡️", gradient: "red", rating: 4.5, multiplayer: true, players: "۵ نفره تیمی", popular: true, pricePerHour: 140000, description: "موبای افسانه‌ای ولو با عمق استراتژیک بی‌نهایت. لیگ دوتای آرنا ایکس فصلی است و تیم برنده به لیگ کشوری معرفی می‌شود.", sysreq: "RTX 4070 | Ryzen 7 | RAM 32GB" },
  { slug: "fortnite", title: "فورتنایت", titleEn: "Fortnite", genre: "بتل رویال", platform: "PC", emoji: "🪂", gradient: "cyan", rating: 4.4, multiplayer: true, players: "۱ تا ۴", popular: true, pricePerHour: 140000, description: "بیلد بزن، بجنگ، برنده شو! فورتنایت با فریم‌های بالای ۲۴۰ روی سیستم‌های ما تجربه‌ای کاملاً متفاوت دارد.", sysreq: "RTX 4070 | مانیتور ۲۴۰Hz" },
  { slug: "gta-v", title: "جی‌تی‌ای وی", titleEn: "GTA V Online", genre: "اکشن", platform: "PC", emoji: "🚗", gradient: "green", rating: 4.6, multiplayer: true, players: "۱ تا ۳۰", popular: true, pricePerHour: 130000, description: "لوس‌سانتوس را فتح کن! سرورهای RP و آزاد با دوستانت روی سیستم‌های قدرتمند ما بازی کن.", sysreq: "RTX 4070 | RAM 32GB" },
  { slug: "cs2", title: "کانتر استرایک ۲", titleEn: "Counter-Strike 2", genre: "شوتر تاکتیکی", platform: "PC", emoji: "💥", gradient: "orange", rating: 4.7, multiplayer: true, players: "۵ نفره تیمی", popular: true, pricePerHour: 140000, description: "نسل جدید کانتر با موتور سورس ۲. رقابت‌های ۵v5 آرنا ایکس هر هفته با لیدربورد رسمی برگزار می‌شود.", sysreq: "RTX 4070 | مانیتور ۲۴۰Hz | صفحه‌کلید مکانیکی" },
  { slug: "rocket-league", title: "راککت لیگ", titleEn: "Rocket League", genre: "ورزشی-ماشینی", platform: "PC", emoji: "🚀", gradient: "violet", rating: 4.3, multiplayer: true, players: "۱ تا ۴", popular: false, pricePerHour: 130000, description: "فوتبال با ماشین‌های راکت‌دار! بازی‌ای که در ۵ دقیقه شما را معتاد خودش می‌کند.", sysreq: "RTX 4070 | دسته Xbox" },
  { slug: "mk1", title: "مورتال کامبت ۱", titleEn: "Mortal Kombat 1", genre: "فایتینگ", platform: "PS5", emoji: "🥊", gradient: "red", rating: 4.2, multiplayer: true, players: "۲ نفره", popular: false, pricePerHour: 160000, description: "نبردهای خونین روی PS5 با فریم‌ریت کامل. چالش هفتگی MK با جایزه ساعت بازی رایگان.", sysreq: "کنسول PS5 | دسته DualSense" },
  { slug: "rdr2", title: "رد دد ریدمشن ۲", titleEn: "Red Dead Redemption 2", genre: "ماجراجویی", platform: "PC", emoji: "🤠", gradient: "orange", rating: 4.9, multiplayer: false, players: "تک‌نفره", popular: false, pricePerHour: 130000, description: "غروب آفتاب وست، روی مانیتور ۴K و سیستم‌های قدرتمند ما داستان آرتور مورگان را دوباره زندگی کن.", sysreq: "RTX 4070 | RAM 32GB | هدفون حرفه‌ای" },
];

const P = [
  { title: "پلن ساعتی", period: "HOUR", price: 150000, hours: 3, features: ["۳ ساعت بازی نامحدود", "دسترسی به PC یا کنسول", "نوشیدنی خنک رایگان", "امتیاز وفاداری ×۱"], badge: null, popular: false, order: 1 },
  { title: "شیفت روزانه", period: "DAY", price: 380000, hours: 10, features: ["۱۰ ساعت بازی", "صندلی رزرو ثابت", "یک اسنک رایگان", "تخفیف ۱۰٪ کافه", "امتیاز وفاداری ×۱.۵"], badge: "پرطرفدار", popular: true, order: 2 },
  { title: "پلن هفتگی", period: "WEEK", price: 1900000, hours: 40, features: ["۴۰ ساعت قابل استفاده در هفته", "اولویت رزرو", "دسترسی اتاق تیمی", "تخفیف ۱۵٪ کافه", "امتیاز وفاداری ×۲"], badge: null, popular: false, order: 3 },
  { title: "پلن ماهانه", period: "MONTH", price: 6900000, hours: 120, features: ["۱۲۰ ساعت در ماه", "صندلی VIP ثابت", "دسترسی کامل اتاق تیمی", "تخفیف ۲۰٪ کافه", "ثبت‌نام رایگان مسابقات", "امتیاز وفاداری ×۳"], badge: "به‌صرفه‌ترین", popular: false, order: 4 },
  { title: "اشتراک VIP", period: "VIP", price: 12900000, hours: 999, features: ["بازی نامحدود ماهانه", "اتاق خصوصی اختصاصی", "دعوت دوستان رایگان", "منوی کافه با ۳۰٪ تخفیف", "پشتیبانی اختصاصی ۲۴/۷", "ورود رایگان همه مسابقات", "امتیاز وفاداری ×۵"], badge: "ویژه", popular: false, order: 5 },
];

async function main() {
  console.log("🌱 Seeding Arena X ...");
  await db.walletTx.deleteMany();
  await db.payment.deleteMany();
  await db.notification.deleteMany();
  await db.tournamentRegistration.deleteMany();
  await db.review.deleteMany();
  await db.booking.deleteMany();
  await db.tournament.deleteMany();
  await db.station.deleteMany();
  await db.game.deleteMany();
  await db.plan.deleteMany();
  await db.post.deleteMany();
  await db.discount.deleteMany();
  await db.contact.deleteMany();
  await db.user.deleteMany();

  const pass = await bcrypt.hash("123456", 10);
  const adminPass = await bcrypt.hash("admin1234", 10);

  const admin = await db.user.create({ data: { name: "مدیر آرنا", email: "admin@arenax.ir", username: "admin", password: adminPass, role: "ADMIN", balance: 0, xp: 9999, level: 5, referralCode: "ARENA-ADMIN" } });
  const operator = await db.user.create({ data: { name: "اپراتور سالن", email: "operator@arenax.ir", username: "operator", password: pass, role: "OPERATOR", referralCode: "ARENA-OPERATOR" } });
  const users = await Promise.all(
    [
      { name: "آرش رادمنش", email: "arash@example.com", username: "arash", xp: 1450, balance: 240000, level: 4 },
      { name: "سارا محمدی", email: "sara@example.com", username: "sara", xp: 2100, balance: 890000, level: 5 },
      { name: "امیرحسین کاظمی", email: "amir@example.com", username: "amirk", xp: 640, balance: 120000, level: 3 },
      { name: "نیلوفر شریفی", email: "niloofar@example.com", username: "niloo", xp: 320, balance: 50000, level: 2 },
    ].map((u) => db.user.create({ data: { ...u, password: pass, referralCode: "REF-" + u.username } }))
  );

  await db.game.createMany({ data: G });
  const games = await db.game.findMany();

  await db.station.createMany({
    data: [
      ...Array.from({ length: 8 }, (_, i) => ({ name: `PC-${String(i + 1).padStart(2, "0")}`, type: "PC", specs: "RTX 4070 | Ryzen 7 | 32GB | مانیتور ۲۴۰Hz", hourlyRate: 150000, online: i < 5 })),
      ...Array.from({ length: 4 }, (_, i) => ({ name: `PS5-${i + 1}`, type: "PS5", specs: "تلویزیون ۵۵ اینچ ۴K | دسته DualSense", hourlyRate: 180000, online: i < 2 })),
      { name: "XBOX-1", type: "XBOX", specs: "Series X | تلویزیون ۴K", hourlyRate: 160000, online: false },
      { name: "VIP-Room", type: "VIP", specs: "اتاق خصوصی ۵ نفره | ساندبار | PCهای هم‌زمان", hourlyRate: 600000, online: true },
    ],
  });

  await db.plan.createMany({ data: P.map((p) => ({ ...p, features: JSON.stringify(p.features) })) });

  const dayAfter = (n: number, h = 18) => { const d = new Date(); d.setDate(d.getDate() + n); d.setHours(h, 0, 0, 0); return d; };
  const isoDay = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  await db.tournament.createMany({
    data: [
      { slug: "fifa-cup-12", title: "جام فیفا آرنا — دوره ۱۲", game: "ای‌اِی اسپورتس فیفا ۲۴", platform: "PS5", emoji: "⚽", date: dayAfter(5, 17), prize: "۵٬۰۰۰٬۰۰۰ تومان + ۲۰ ساعت بازی رایگان", entryFee: 150000, capacity: 32, teamSize: 1, rules: "۱- بازی‌ها دو مرحله‌ای (گروهی و حذفی) است.\n۲- زمان هر بازی ۶ دقیقه.\n۳- تأخیر بیش از ۱۰ دقیقه = بازنده.\n۴- استفاده از تیم‌های ملی آزاد است.", description: "بزرگ‌ترین تورنمنت ماهانه فیفای آرنا ایکس؛ ۳۲ بازیکن، تک‌حذفی، با پخش زنده و جوایز نقدی." },
      { slug: "valorant-clash", title: "ولورنت کلاش — پاییز", game: "ولورنت", platform: "PC", emoji: "🔫", date: dayAfter(9, 16), prize: "۱۰٬۰۰۰٬۰۰۰ تومان برای تیم قهرمان", entryFee: 400000, capacity: 16, teamSize: 5, rules: "۱- تیم‌ها ۵ نفره (یک ذخیره مجاز).\n۲- نقشه‌ها با قرعه انتخاب می‌شوند.\n۳- سیستم Bo1 تا فینال، فینال Bo3.\n۴- رعایت قوانین Riot و رفتار ورزشی الزامی است.", description: "تورنمنت تیمی ولورنت با ۱۶ تیم، داوری رسمی و پخش زنده در دیسکورد آرنا." },
      { slug: "cs2-weekly", title: "لیگ هفتگی CS2", game: "کانتر استرایک ۲", platform: "PC", emoji: "💥", date: dayAfter(2, 19), prize: "۳٬۰۰۰٬۰۰۰ تومان + ساعت بازی", entryFee: 250000, capacity: 10, teamSize: 5, rules: "۱- دو تیم برنده هفته قبل، سید می‌شوند.\n۲- MR12 و قوانین استاندارد والو.\n۳- ثبت‌نام تا ۲۴ ساعت قبل مسابقه.", description: "جنگ هفتگی تیم‌های CS2 آرنا؛ سریع، فشرده و پرشور. جدول امتیازات فصلی و جایزه پایان فصل." },
    ],
  });

  await db.post.createMany({
    data: [
      { slug: "arena-x-tournaments-announce", title: "تقویم مسابقات پاییزی آرنا ایکس منتشر شد", excerpt: "سه تورنمنت بزرگ فیفا، ولورنت و CS2 با مجموع جوایز ۲۰ میلیون تومان در راه است.", content: "پاییز امسال داغ‌تر از همیشه است!\n\nتقویم کامل مسابقات پاییزی گیم‌نت آرنا ایکس منتشر شد. سه تورنمنت اصلی شامل جام فیفا، ولورنت کلاش و لیگ هفتگی CS2 با مجموع جوایز بیش از ۲۰ میلیون تومان برگزار می‌شود.\n\nثبت‌نام از همین سایت و به‌صورت آنلاین انجام می‌شود و ظرفیت‌ها محدود است. تیم‌هایی که عضو پلن ماهانه هستند، از ثبت‌نام رایگان بهره‌مند می‌شوند.", category: "مسابقات", emoji: "🏆", authorId: admin.id },
      { slug: "rtx-4070-upgrade", title: "ارتقای کامل سالن PC به RTX 4070", excerpt: "هر ۱۲ سیستم سالن اصلی با کارت گرافیک RTX 4070 و مانیتور ۲۴۰ هرتز به‌روز شد.", content: "ما قول داده بودیم بهترین تجربه ممکن را بسازیم؛ حالا شد!\n\nتمام ۱۲ سیستم سالن اصلی آرنا ایکس به کارت گرافیک GeForce RTX 4070 ارتقا یافتند و مانیتورهای ۲۴۰ هرتز Lenovo Legion جایگزین شدند.\n\nنتیجه؟ فریم‌های بالا، لگ صفر و تجربه‌ای که فقط باید امتحانش کنید. همین حالا رزرو کن!", category: "اخبار گیم‌نت", emoji: "🖥️", authorId: admin.id },
      { slug: "warzone-season-guide", title: "راهنمای کامل فصل جدید وارزون", excerpt: "نقشه جدید، متا گان‌ها و نکات رنک پوش؛ هرچیزی که برای شروع فصل لازم داری.", content: "فصل جدید وارزون با نقشه Urzikstan بازگشته و متا کاملاً عوض شده.\n\nدر این مقاله بهترین لودآوت‌های فصل، نقاط فرود امن و تکنیک‌های چرخش سریع را مرور کرده‌ایم. سیستم‌های RTX 4070 آرنا ایکس برای تست این تغییرات آماده‌اند.\n\nهر پنجشنبه شب‌وارزون آرنا با تخفیف ۳۰٪ برگزار می‌شود.", category: "مقالات گیمینگ", emoji: "🎯", authorId: admin.id },
      { slug: "game-night-fridays", title: "شب‌گیم جمعه‌ها؛ تخفیف ۳۰٪ تا سپیده‌دم", excerpt: "جمعه‌ها از نیمه‌شب، همه پلن‌ها با ۳۰٪ تخفیف و اسنک رایگان.", content: "جمعه‌ها تو آرنا ایکس خواب ممنوع است!\n\nاز ساعت ۱۲ شب تا ۸ صبح، تمام پلن‌های ساعتی ۳۰٪ تخفیف دارند و با هر رزرو، یک اسنک رایگان می‌گیرید.\n\nاتاق تیمی هم با ظرفیت محدود در همین ساعت‌ها فعال است؛ سریع رزرو کن.", category: "تخفیف‌ها", emoji: "🌙", authorId: admin.id },
      { slug: "new-cafe-menu", title: "منوی جدید کافه آرنا رسید", excerpt: "لاته راکت، موهیتو منیون و پاپ‌کورن کارامل؛ منوی مخصوص گیمرها.", content: "کافه آرنا ایکس منوی تازه‌ای برای پاییز آماده کرده است.\n\nلاته راکت با شات دوگانه اسپرسو، موهیتو منیون بدون الکل و پاپ‌کورن کارامل از پرفروش‌های جدید هستند.\n\nسفارش از داخل بازی: فقط کافیست از صندلی پیام بدهی؛ سفارش کنار سیستم تحویل داده می‌شود.", category: "کافه", emoji: "☕", authorId: admin.id },
    ],
  });

  await db.discount.createMany({
    data: [
      { code: "WELCOME10", percent: 10, maxUse: 500, active: true, expiresAt: dayAfter(60) },
      { code: "GAMENIGHT20", percent: 20, maxUse: 200, active: true, expiresAt: dayAfter(30) },
    ],
  });

  const t = dayAfter(-3, 15);
  for (let i = 0; i < 6; i++) {
    await db.booking.create({
      data: {
        userId: users[i % users.length].id,
        stationId: (await db.station.findFirstOrThrow({ where: { type: i % 3 === 0 ? "PS5" : "PC" } })).id,
        date: isoDay(-(i % 4) - 1),
        startHour: 14 + (i % 4),
        hours: 2 + (i % 3),
        totalPrice: 300000 + i * 50000,
        payMethod: i % 2 ? "wallet" : "online",
        status: "DONE",
        createdAt: t,
      },
    });
  }

  const siteReviews = [
    { u: users[0], r: 5, c: "بهترین گیم‌نتی که تا حالا رفتم؛ پینگ عالی، سیستم‌های تمیز و مدیریت حرفه‌ای." },
    { u: users[1], r: 5, c: "کافه‌ش فوق‌العاده‌ست و اتاق تیمی برای تمرین بی‌نظیره. رزرو آنلاین هم خیلی راحت." },
    { u: users[2], r: 4, c: "مسابقه‌هاش انگیزه‌دار می‌کنه. ای کاش ساعت‌های شلوغ‌تر سیستم بیشتری داشت." },
    { u: users[3], r: 5, c: "به عنوان دختر تو فضای گیمینگ خیلی راحت بودم؛ احترام و امنیت کامل. ممنون آرنا." },
  ];
  for (const s of siteReviews) await db.review.create({ data: { userId: s.u.id, target: "SITE", rating: s.r, comment: s.c, approved: true } });

  await db.review.create({ data: { userId: users[0].id, gameId: games[2].id, target: "GAME", rating: 5, comment: "با مانیتور ۲۴۰ هرتز آرنا، ایماژول دیگه اصلاً حس نمیشه!", approved: true } });
  await db.review.create({ data: { userId: users[1].id, gameId: games[0].id, target: "GAME", rating: 5, comment: "تورنمنت فیفا اینجا دیگه‌ی! داوری منصفانه و جایزه نقدی.", approved: true } });

  await db.notification.createMany({
    data: [
      { userId: users[0].id, title: "رزرو شما تایید شد 🎮", body: "رزرو PC-03 شما برای فردا ساعت ۱۶ تایید شد. خوب بازی کنی!" },
      { userId: users[1].id, title: "تخفیف ویژه شب‌گیم 🌙", body: "جمعه شب‌ها ۳۰٪ تخفیف ویژه اعضا فعال شد. کد GAMENIGHT20 را استفاده کن." },
    ],
  });

  await db.contact.create({ data: { name: "کاربر تستی", email: "test@example.com", phone: "09120000000", subject: "درخواست ایونت خصوصی", message: "سلام، می‌خواهیم برای تولد تیم یک ایونت خصوصی بگذاریم." } });

  console.log("✅ Seed done. (Default dev credentials are seeded from seed.ts — change them before any real deployment.)");
}

main().finally(() => db.$disconnect());
