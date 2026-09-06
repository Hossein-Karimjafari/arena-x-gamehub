"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TournamentRow({ id, status }: { id: string; status: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function set(s: string) {
    setBusy(true);
    await fetch(`/api/admin/tournaments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: s }) });
    setBusy(false);
    router.refresh();
  }

  return (
    <select disabled={busy} value={status} onChange={(e) => set(e.target.value)} className="input !w-32 !px-2 !py-1 !text-xs">
      <option value="OPEN">در حال ثبت‌نام</option>
      <option value="FULL">تکمیل</option>
      <option value="ONGOING">در حال برگزاری</option>
      <option value="DONE">پایان‌یافته</option>
    </select>
  );
}
