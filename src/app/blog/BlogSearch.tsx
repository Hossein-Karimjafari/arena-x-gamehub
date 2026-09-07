"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IconSearch } from "@/components/icons";

export default function BlogSearch({ categories }: { categories: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const cat = sp.get("cat") ?? "";

  function apply(patch: Record<string, string | null>) {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.push(`/blog?${p.toString()}`);
  }

  return (
    <div className="glass p-5">
      <form onSubmit={(e) => { e.preventDefault(); apply({ q }); }} className="mb-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در مقالات..." className="input" />
        <button aria-label="جستجو" className="btn-neon grid shrink-0 place-items-center !px-5 !py-2.5 !text-sm"><IconSearch className="h-4 w-4" /></button>
      </form>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => apply({ cat: null })} className={`chip !px-4 !py-2 ${!cat ? "!border-neon-purple !bg-neon-purple/20 !text-white" : ""}`}>همه</button>
        {categories.map((c) => (
          <button key={c} onClick={() => apply({ cat: c === cat ? null : c })} className={`chip !px-4 !py-2 ${c === cat ? "!border-neon-purple !bg-neon-purple/20 !text-white" : ""}`}>{c}</button>
        ))}
      </div>
    </div>
  );
}
