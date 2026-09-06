"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserRow({ id, role, balance }: { id: string; role: string; balance: number }) {
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function update(patch: Record<string, unknown>) {
    setBusy(true);
    await fetch(`/api/admin/users/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    setBusy(false);
    setAmount("");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1">
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="+تومان" className="input !w-24 !px-2 !py-1 !text-xs" dir="ltr" />
      <button disabled={busy || !amount} onClick={() => update({ balanceAdd: Number(amount) })} className="rounded-lg border border-neon-green/40 px-2 py-1 text-[10px] text-neon-green hover:bg-neon-green/10 disabled:opacity-40">شارژ</button>
      <select value={role} onChange={(e) => update({ role: e.target.value })} className="input !w-24 !px-2 !py-1 !text-xs">
        <option value="USER">USER</option>
        <option value="OPERATOR">OPERATOR</option>
        <option value="ADMIN">ADMIN</option>
      </select>
    </div>
  );
}
