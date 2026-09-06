"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { SITE } from "@/lib/constants";

const LINKS = [
  { href: "/", label: "خانه" },
  { href: "/games", label: "بازی‌ها" },
  { href: "/booking", label: "رزرو آنلاین" },
  { href: "/tournaments", label: "مسابقات" },
  { href: "/pricing", label: "تعرفه‌ها" },
  { href: "/blog", label: "اخبار" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس" },
];

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-neon-violet to-neon-purple font-display text-lg font-black text-white shadow-neon">AX</span>
            <span className="leading-tight">
              <span className="block font-display text-base font-extrabold tracking-wider text-white">ARENA<span className="text-neon-purple">X</span></span>
              <span className="block text-[11px] text-slate-400">{SITE.name}</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                  path === l.href ? "text-white bg-white/10" : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {session ? (
              <>
                {(session.user.role === "ADMIN" || session.user.role === "OPERATOR") && (
                  <Link href="/admin" className="chip !text-neon-pink hover:!border-neon-pink/50">پنل مدیریت</Link>
                )}
                <Link href="/dashboard" className="btn-neon !px-5 !py-2 !text-sm">
                  {session.user.name?.split(" ")[0] || "پروفایل"}
                </Link>
                <button onClick={() => signOut()} className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white">خروج</button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white">ورود</Link>
                <Link href="/register" className="btn-neon !px-5 !py-2 !text-sm">عضویت</Link>
              </>
            )}
          </div>

          <button onClick={() => setOpen(!open)} className="lg:hidden grid h-10 w-10 place-items-center rounded-lg border border-white/10 text-white" aria-label="منو" aria-expanded={open} aria-controls="mobile-nav">
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="lg:hidden border-t border-white/5 bg-ink/95 px-4 pb-6 pt-3">
          <div className="grid grid-cols-2 gap-2">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`rounded-lg px-4 py-2.5 text-sm font-semibold ${path === l.href ? "bg-white/10 text-white" : "text-slate-300"}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="btn-neon flex-1 !py-2 !text-sm">داشبورد من</Link>
                <button onClick={() => signOut()} className="btn-outline flex-1 !py-2 !text-sm">خروج</button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline flex-1 !py-2 !text-sm">ورود</Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-neon flex-1 !py-2 !text-sm">عضویت</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
