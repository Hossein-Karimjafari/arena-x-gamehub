import { z } from "zod";

export const phoneRe = /^09\d{9}$/;
export const dateRe = /^\d{4}-\d{2}-\d{2}$/;
export const slugRe = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const WORK_START = 8;
export const WORK_END = 24;

export function isValidDate(s: string): boolean {
  if (!dateRe.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

export function isPastDate(s: string): boolean {
  const today = new Date();
  const t = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const d = new Date(s + "T00:00:00Z");
  return d < t;
}

export const bookingSchema = z.object({
  stationId: z.string().min(1),
  date: z.string().refine(isValidDate, "تاریخ نامعتبر است").refine((s) => !isPastDate(s), "تاریخ نمی‌تواند در گذشته باشد"),
  startHour: z.number().int().min(WORK_START).max(WORK_END - 1),
  hours: z.number().int().min(1).max(8),
  payMethod: z.enum(["onsite", "wallet", "online"]),
  discountCode: z.string().trim().max(32).optional(),
  guestName: z.string().trim().min(2, "نام حداقل ۲ حرف").max(60).optional(),
  guestPhone: z.string().regex(phoneRe, "موبایل باید 11 رقم و با 09 شروع شود").optional(),
}).superRefine((b, ctx) => {
  if (b.startHour + b.hours > WORK_END) ctx.addIssue({ code: "custom", message: "خارج از ساعت کاری است" });
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "نام حداقل ۲ حرف").max(60).optional(),
  username: z
    .string()
    .trim()
    .min(3, "نام کاربری حداقل ۳ حرف")
    .max(24, "نام کاربری حداکثر ۲۴ حرف")
    .regex(/^[a-zA-Z0-9_]+$/, "نام کاربری فقط حروف انگلیسی، عدد و _"),
  email: z.string().trim().toLowerCase().email("ایمیل نامعتبر").optional().or(z.literal("")),
  phone: z.string().trim().regex(phoneRe, "موبایل نامعتبر (09xxxxxxxxx)").optional().or(z.literal("")),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(72),
  referral: z.string().trim().max(40).optional(),
});

export const loginSchema = z.object({
  id: z.string().trim().min(3).max(80),
  password: z.string().min(1).max(72),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, "نام حداقل ۲ حرف").max(60).optional(),
  phone: z.string().trim().regex(phoneRe, "موبایل نامعتبر").optional().or(z.literal("")),
  email: z.string().trim().toLowerCase().email("ایمیل نامعتبر").optional().or(z.literal("")),
});

export const passwordChangeSchema = z.object({
  current: z.string().min(1, "رمز فعلی الزامی است").max(72),
  next: z.string().min(6, "رمز جدید حداقل ۶ کاراکتر").max(72),
});

export const topupSchema = z.object({
  amount: z.number({ message: "مبلغ نامعتبر" }).int().refine((a) => [200000, 500000, 1000000, 2000000].includes(a), "مبلغ نامعتبر"),
});

export const tournamentRegisterSchema = z.object({
  teamName: z.string().trim().min(2, "نام تیم حداقل ۲ حرف").max(40).optional(),
  contact: z.string().trim().min(4, "شماره تماس الزامی است").max(20),
});

export const reviewSchema = z.object({
  gameId: z.string().min(1).optional().or(z.literal("")),
  target: z.enum(["SITE", "GAME"]).default("SITE"),
  rating: z.number().int().min(1, "امتیاز الزامی است").max(5),
  comment: z.string().trim().min(3, "متن دیدگاه حداقل ۳ حرف").max(1000, "متن حداکثر ۱۰۰۰ حرف"),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "نام حداقل ۲ حرف").max(60),
  email: z.string().trim().toLowerCase().email("ایمیل نامعتبر"),
  phone: z.string().trim().regex(phoneRe, "موبایل نامعتبر").optional().or(z.literal("")),
  subject: z.string().trim().min(3, "موضوع حداقل ۳ حرف").max(100),
  message: z.string().trim().min(10, "پیام حداقل ۱۰ حرف").max(2000, "پیام حداکثر ۲۰۰۰ حرف"),
});

export const discountCheckSchema = z.object({
  code: z.string().trim().min(2, "کد را وارد کنید").max(32),
});

export const forgotSchema = z.object({
  email: z.string().trim().toLowerCase().email("ایمیل نامعتبر"),
});

export const resetSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(6, "رمز حداقل ۶ کاراکتر").max(72),
});

export const roleEnum = z.enum(["USER", "OPERATOR", "ADMIN"]);
export const bookingStatusEnum = z.enum(["PENDING", "CONFIRMED", "DONE", "CANCELLED"]);
export const stationTypeEnum = z.enum(["PC", "PS5", "XBOX", "VIP"]);
