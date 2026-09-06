"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { toman } from "@/lib/constants";

/**
 * Sandbox payment simulator (used when ZARINPAL_MERCHANT_ID is not configured).
 * Mimics the gateway: user can "pay" or "cancel", then the app hits the real
 * verify callback so the production code path stays identical.
 */
function SimulateInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const authority = sp.get("authority") ?? "";
  const amount = Number(sp.get("amount") ?? 0);
  const [busy, setBusy] = useState(false);

  async function decide(ok: boolean) {
    setBusy(true);
    const base = typeof window !== "undefined" ? window.location.origin : "";
    await fetch(`/api/wallet/verify?Authority=${encodeURIComponent(authority)}&Status=${ok ? "OK" : "NOK"}`);
    router.push(`/dashboard/wallet${ok ? "?pay=success" : "?pay=failed"}`);
    void base;
  }

  if (!authority) return <p className="glass p-8 text-center text-slate-300">درخواست پرداخت نامعتبر است.</p>;

  return (
    <div className="glass mx-auto max-w-md p-8 text-center">
      <p className="mb-1 font-display text-xl font-black text-white">درگاه پرداخت آزمایشی</p>
      <p className="mb-6 text-xs text-slate-400">این صفحه جایگزین درگاه بانکی در حالت سندباکس است.</p>
      <div className="glass mb-6 rounded-xl p-4 text-sm">
        <div className="flex justify-between"><span className="text-slate-400">شناسه تراکنش</span><span dir="ltr" className="font-mono text-xs text-slate-200">{authority.slice(0, 16)}…</span></div>
        <div className="mt-2 flex justify-between"><span className="text-slate-400">مبلغ</span><span className="font-bold text-neon-green">{toman(amount)}</span></div>
      </div>
      <div className="flex gap-3">
        <button disabled={busy} onClick={() => decide(true)} className="btn-neon flex-1 !py-3 disabled:opacity-50">پرداخت موفق</button>
        <button disabled={busy} onClick={() => decide(false)} className="btn-outline flex-1 !py-3 disabled:opacity-50">انصراف</button>
      </div>
    </div>
  );
}

export default function PaySimulatePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <Suspense fallback={<p className="text-center text-slate-400">در حال بارگذاری…</p>}>
        <SimulateInner />
      </Suspense>
    </div>
  );
}
