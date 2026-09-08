"use client";

import Image from "next/image";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-32 text-center">
      <Image src="/images/error.webp" alt="خطا" width={192} height={192} className="mb-4 h-48 w-48 rounded-3xl object-cover shadow-neon" />
      <h1 className="mb-2 font-display text-2xl font-black text-white">اوه! خطایی رخ داد</h1>
      <p className="mb-6 text-sm text-slate-400">مشکلی در نمایش این بخش پیش آمد. می‌توانی دوباره تلاش کنی.</p>
      {error.digest && <p className="mb-6 font-mono text-[10px] text-slate-600" dir="ltr">{error.digest}</p>}
      <button onClick={reset} className="btn-neon !py-3">تلاش مجدد</button>
    </div>
  );
}
