"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewRow({ id, approved }: { id: string; approved: boolean }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function patch(data: Record<string, unknown>) {
    setBusy(true);
    await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
    setBusy(false);
    router.refresh();
  }
  async function remove() {
    if (!confirm("دیدگاه حذف شود؟")) return;
    setBusy(true);
    await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      {!approved && <button disabled={busy} onClick={() => patch({ approved: true })} className="rounded-lg border border-neon-green/40 px-2 py-1 text-[10px] text-neon-green hover:bg-neon-green/10">تایید</button>}
      {approved && <button disabled={busy} onClick={() => patch({ approved: false })} className="rounded-lg border border-white/20 px-2 py-1 text-[10px] text-slate-300">لغو تایید</button>}
      <button disabled={busy} onClick={remove} className="rounded-lg border border-neon-red/40 px-2 py-1 text-[10px] text-neon-red">حذف</button>
    </div>
  );
}
