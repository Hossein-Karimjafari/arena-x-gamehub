export const SITE = {
  name: "گیم‌نت آرنا ایکس",
  nameEn: "ARENA X",
  tagline: "میدان نبرد گیمرهای حرفه‌ای",
  phone: "۰۲۱-۹۱۰۰۰۰۰۰",
  mobile: "09121234567",
  address: "تهران، خیابان ولیعصر، بالاتر از پارک ساعی، پلاک ۲۴",
  hours: "همه روزه ۹ صبح تا ۱۲ شب (جمعه‌ها ۲۴ ساعته)",
  socials: {
    instagram: "https://instagram.com/arenax.gg",
    telegram: "https://t.me/arenax_gg",
    whatsapp: "https://wa.me/989121234567",
    youtube: "https://youtube.com/@arenax.gg",
    discord: "https://discord.gg/arenax",
  },
};

export const FEATURES = [
  { emoji: "🖥️", title: "سیستم‌های نسل جدید", desc: "۱۲ سیستم گیمینگ با کارت گرافیک RTX 4070 و مانیتور ۲۴۰ هرتز برای روان‌ترین تجربه بازی" },
  { emoji: "🎮", title: "کنسول‌های PS5 و XBOX", desc: "۶ کنسول نسل نهم با تلویزیون‌های ۵۵ اینچی ۴K و صندلی‌های گیمینگ راحت" },
  { emoji: "🌐", title: "اینترنت فیبر نوری", desc: "اتصال فیبر اختصاصی با پینگ زیر ۱۰ میلی‌ثانیه؛ بدون لگ، بدون بهانه" },
  { emoji: "🛋️", title: "اتاق تیمی و VIP", desc: "اتاق خصوصی ۵ نفره برای تیم‌ها و استریم با صندلی راک، ساندبار و صداگیری حرفه‌ای" },
  { emoji: "☕", title: "کافه گیمینگ", desc: "قهوه تخصصی، انرژی‌زا و اسنک با منوی اختصاصی گیمرها؛ سفارش از روی صندلی" },
  { emoji: "🏆", title: "مسابقات هفتگی", desc: "تورنمنت‌های دوره‌ای با جوایز نقدی و لحظه‌ای؛ جدول امتیازات و لیدربورد اختصاصی" },
];

export const TESTIMONIALS = [
  { name: "آرش رادمنش", role: "کاپیتان تیم NoScope", rating: 5, text: "بهترین پینگی که تو تهران تست کردم. اتاق تیمی‌شون برای تمرین ولورنت عالیه و سیستم‌ها فوق‌تمیزن." },
  { name: "سارا محمدی", role: "استریمر", rating: 5, text: "ماهانه VIP گرفتم؛ صندلی ثابت، مانیتور ۲۴۰ هرتز و کافه‌ش عاشقشم. تیم پشتیبانی هم همیشه پاسخگوئه." },
  { name: "امیرحسین کاظمی", role: "بازیکن فیفا", rating: 4, text: "مسابقه‌های آخر هفته‌ش هیجان داره، جوایز واقعیه و جدول امتیازات شفافه. حتماً امتحان کنید." },
  { name: "نیلوفر شریفی", role: "گیمر کنسول", rating: 5, text: "PS5 با تلویزیون ۵۵ اینچ و صندلی راحت... تجربه‌ای که تو خونه نداری. رزرو آنلاینش هم خیلی راحته." },
];

export const GALLERY = [
  { emoji: "🖥️", image: "/images/gallery-pc-lounge.jpg", title: "سالن PC — ۱۲ سیستم RTX", gradient: "purple" },
  { emoji: "🎮", image: "/images/gallery-console-ps5.jpg", title: "استیشن کنسول PS5", gradient: "cyan" },
  { emoji: "🛋️", image: "/images/gallery-vip-room.jpg", title: "اتاق تیمی VIP", gradient: "pink" },
  { emoji: "☕", image: "/images/gallery-cafe.jpg", title: "کافه گیمینگ", gradient: "green" },
  { emoji: "🏆", image: "/images/gallery-tournament.jpg", title: "مراسم مسابقات", gradient: "violet" },
  { emoji: "🎧", image: "/images/gallery-streamer.jpg", title: "گوشه استریمرها", gradient: "cyan" },
];

export const WORK_HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 تا 23:00

export const LEVELS = [
  { level: 1, xp: 0, title: "تازه‌کار", color: "text-zinc-400" },
  { level: 2, xp: 200, title: "گیمر", color: "text-neon-cyan" },
  { level: 3, xp: 500, title: "سلحشور", color: "text-neon-green" },
  { level: 4, xp: 1000, title: "حرفه‌ای", color: "text-neon-purple" },
  { level: 5, xp: 2000, title: "اسطوره", color: "text-neon-pink" },
];

export function levelFromXp(xp: number) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) current = l;
  const next = LEVELS.find((l) => l.xp > xp);
  return { ...current, nextXp: next?.xp ?? null, progress: next ? Math.min(100, Math.round(((xp - current.xp) / (next.xp - current.xp)) * 100)) : 100 };
}

export function toman(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n) + " تومان";
}

export function faNum(n: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(n));
}

export function dateFa(d: Date | string, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" }) {
  return new Intl.DateTimeFormat("fa-IR", opts).format(new Date(d));
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function isoAfter(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export const GRADIENTS: Record<string, string> = {
  purple: "from-violet-600/60 via-purple-800/40 to-fuchsia-600/50",
  cyan: "from-cyan-500/50 via-sky-700/40 to-blue-600/50",
  green: "from-emerald-500/50 via-teal-700/40 to-green-600/50",
  pink: "from-pink-500/50 via-rose-700/40 to-red-600/50",
  violet: "from-indigo-500/50 via-violet-700/40 to-purple-600/50",
  orange: "from-orange-500/50 via-amber-700/40 to-yellow-600/40",
};

export const STATUS_FA: Record<string, string> = {
  PENDING: "در انتظار تایید",
  CONFIRMED: "تایید شده",
  DONE: "انجام شده",
  CANCELLED: "لغو شده",
  OPEN: "در حال ثبت‌نام",
  FULL: "تکمیل ظرفیت",
  ONGOING: "در حال برگزاری",
  SUCCESS: "موفق",
  FAILED: "ناموفق",
};

export const PLATFORM_FA: Record<string, string> = { PC: "کامپیوتر", PS5: "پلی‌استیشن ۵", XBOX: "ایکس‌باکس", VIP: "اتاق خصوصی" };

export function addXp(amount: number) {
  return Math.max(0, amount);
}
