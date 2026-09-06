"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DiscountRow({ id, active }: { id: string; active: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function toggle() {
    setBusy(true);
    await fetch(`/api/admin/discounts/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !active }) });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("کد حذف شود؟")) return;
    setBusy(true);
    await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      <button disabled={busy} onClick={toggle} className="rounded-lg border border-white/20 px-2 py-1 text-[10px] text-slate-300">{active ? "غیرفعال" : "فعال"}</button>
      <button disabled={busy} onClick={remove} className="rounded-lg border border-neon-red/40 px-2 py-1 text-[10px] text-neon-red">حذف</button>
    </div>
  );
}
