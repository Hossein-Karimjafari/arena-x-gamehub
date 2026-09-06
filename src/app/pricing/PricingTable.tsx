"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toman } from "@/lib/constants";

type Plan = { id: string; title: string; period: string; price: number; hours: number; features: string[]; badge: string | null; popular: boolean };

export default function PricingTable({ plans }: { plans: Plan[] }) {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function buy(plan: Plan) {
    if (!session) { router.push("/login"); return; }
    setBusyId(plan.id);
    setMsg(null);
    const res = await fetch("/api/wallet/purchase-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id }),
    });
    const j = await res.json();
    setBusyId(null);
    if (res.ok) {
      setMsg(`✅ پلن «${plan.title}» فعال شد! ${j.hoursAdded} ساعت به حساب بازی‌ات اضافه شد.`);
      await update(); // refresh JWT-stored balance so the UI shows the new value immediately
      router.refresh();
    } else setMsg("❌ " + (j.error ?? "خطا"));
  }

  return (
    <>
      {msg && <div className="glass mx-auto mb-8 max-w-xl p-4 text-center text-sm">{msg}</div>}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((p) => (
          <div key={p.id} className={`glass card-hover relative flex flex-col p-7 ${p.popular ? "!border-neon-purple/60 shadow-neon" : ""}`}>
            {p.badge && <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-l from-neon-violet to-neon-purple px-4 py-1 text-[11px] font-black text-white shadow-neon">{p.badge}</span>}
            <h3 className="mb-1 text-lg font-black text-white">{p.title}</h3>
            <p className="mb-4 text-xs text-slate-500">{p.hours >= 999 ? "بازی نامحدود" : `${p.hours} ساعت بازی`}</p>
            <p className="mb-6"><span className="font-display text-3xl font-black text-white">{toman(p.price)}</span></p>
            <ul className="mb-8 flex-1 space-y-3 text-sm text-slate-300">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2"><span className="text-neon-green">✓</span><span>{f}</span></li>
              ))}
            </ul>
            <button onClick={() => buy(p)} disabled={busyId === p.id} className={`${p.popular ? "btn-neon" : "btn-outline"} w-full !py-3 disabled:opacity-50`}>
              {busyId === p.id ? "..." : session ? "خرید و فعال‌سازی" : "برای خرید وارد شو"}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-8 text-center text-xs text-slate-500">
        🔋 می‌خواهی فقط اعتبار شارژ کنی؟ از <Link href="/dashboard/wallet" className="text-neon-purple underline">کیف پول</Link> استفاده کن.
      </p>
    </>
  );
}
