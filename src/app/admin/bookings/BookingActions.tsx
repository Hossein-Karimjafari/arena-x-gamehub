"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BookingActions({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function set(s: string) {
    setBusy(true);
    await fetch(`/api/admin/bookings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-1">
      {status !== "CONFIRMED" && <button disabled={busy} onClick={() => set("CONFIRMED")} className="rounded-lg border border-neon-green/40 px-2 py-1 text-[10px] text-neon-green hover:bg-neon-green/10">تایید</button>}
      {status !== "DONE" && <button disabled={busy} onClick={() => set("DONE")} className="rounded-lg border border-neon-cyan/40 px-2 py-1 text-[10px] text-neon-cyan hover:bg-neon-cyan/10">اتمام</button>}
      {status !== "CANCELLED" && <button disabled={busy} onClick={() => set("CANCELLED")} className="rounded-lg border border-neon-red/40 px-2 py-1 text-[10px] text-neon-red hover:bg-neon-red/10">لغو</button>}
    </div>
  );
}
