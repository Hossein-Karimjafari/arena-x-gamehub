import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-32 text-center">
      <Image src="/images/404.jpg" alt="۴۰۴ — صفحه پیدا نشد" width={192} height={192} priority className="mb-4 h-48 w-48 rounded-3xl object-cover shadow-neon" />
      <h1 className="mb-2 font-display text-3xl font-black text-white">۴۰۴ — صفحه پیدا نشد</h1>
      <p className="mb-8 text-sm text-slate-400">این صفحه در آرنا وجود ندارد؛ شاید حذف شده یا آدرس اشتباه است.</p>
      <div className="flex gap-3">
        <Link href="/" className="btn-neon !py-3">بازگشت به خانه</Link>
        <Link href="/booking" className="btn-outline !py-3">رزرو سیستم</Link>
      </div>
    </div>
  );
}
