"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toman } from "@/lib/constants";

const AMOUNTS = [200000, 500000, 1000000, 2000000];

function WalletInner() {
  const [busy, setBusy] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();
  const sp = useSearchParams();
  const pay = sp.get("pay");

  async function topup(amount: number) {
    setBusy(amount);
    setMsg(null);
    const res = await fetch("/api/wallet/topup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const j = await res.json();
    setBusy(null);
    if (res.ok && j.payUrl) {
      window.location.href = j.payUrl; // → gateway or sandbox simulator
    } else setMsg("❌ " + (j.error ?? "خطا"));
  }

  const payMsg: Record<string, string> = {
    success: "✅ پرداخت با موفقیت انجام و کیف پول شارژ شد",
    failed: "❌ پرداخت ناموفق بود یا لغو شد",
    already: "این پرداخت قبلاً ثبت شده است",
    notfound: "پرداخت یافت نشد",
    invalid: "درخواست پرداخت نامعتبر است",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="section-title mb-2 text-center neon-text">👛 کیف پول</h1>
      <p className="mb-10 text-center text-sm text-slate-400">شارژ کن، پلن بخر، بدون معطلی بازی کن.</p>

      {pay && payMsg[pay] && (
        <p className={`glass mb-6 p-4 text-center text-sm ${pay === "success" || pay === "already" ? "text-neon-green" : "text-neon-red"}`}>{payMsg[pay]}</p>
      )}

      <div className="glass p-8 text-center">
        <p className="mb-2 text-sm text-slate-400">شارژ آنلاین از طریق درگاه امن (سندباکس)</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {AMOUNTS.map((a) => (
            <button key={a} onClick={() => topup(a)} disabled={busy === a}
              className="glass card-hover p-5 text-center font-bold text-white disabled:opacity-50">
              <span className="block text-2xl">💰</span>
              {toman(a)}
              <span className="mt-1 block text-[10px] font-normal text-slate-500">+ امتیاز وفاداری</span>
            </button>
          ))}
        </div>
        {msg && <p className="mt-4 text-sm text-neon-red">{msg}</p>}
        <a href="/pricing" className="btn-neon mt-6 inline-block !py-2.5 !text-sm">مشاهده پلن‌های اشتراک ←</a>
      </div>
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<p className="text-center text-slate-400">در حال بارگذاری…</p>}>
      <WalletInner />
    </Suspense>
  );
}
