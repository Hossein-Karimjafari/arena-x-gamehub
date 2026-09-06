"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function GamesFilter({ genres, platforms }: { genres: string[]; platforms: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");

  function apply(patch: Record<string, string | null>) {
    const p = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    router.push(`/games?${p.toString()}`);
  }

  const genre = sp.get("genre") ?? "";
  const platform = sp.get("platform") ?? "";
  const multi = sp.get("multi") ?? "";
  const sort = sp.get("sort") ?? "rating";

  return (
    <div className="glass p-5">
      <form onSubmit={(e) => { e.preventDefault(); apply({ q }); }} className="mb-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی بازی..." className="input" />
        <button className="btn-neon shrink-0 !px-5 !py-2.5 !text-sm">🔍</button>
      </form>
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => apply({ genre: null })} className={`chip !px-4 !py-2 ${!genre ? "!border-neon-purple !bg-neon-purple/20 !text-white" : ""}`}>همه ژانرها</button>
        {genres.map((g) => (
          <button key={g} onClick={() => apply({ genre: g === genre ? null : g })} className={`chip !px-4 !py-2 ${g === genre ? "!border-neon-purple !bg-neon-purple/20 !text-white" : ""}`}>{g}</button>
        ))}
        <span className="mx-2 hidden h-5 w-px bg-white/10 md:block" />
        <button onClick={() => apply({ platform: null })} className={`chip !px-4 !py-2 ${!platform ? "!border-neon-cyan !bg-neon-cyan/20 !text-white" : ""}`}>همه پلتفرم‌ها</button>
        {platforms.map((p) => (
          <button key={p} onClick={() => apply({ platform: p === platform ? null : p })} className={`chip !px-4 !py-2 ${p === platform ? "!border-neon-cyan !bg-neon-cyan/20 !text-white" : ""}`}>{p}</button>
        ))}
        <span className="mx-2 hidden h-5 w-px bg-white/10 md:block" />
        <button onClick={() => apply({ multi: multi ? null : "1" })} className={`chip !px-4 !py-2 ${multi ? "!border-neon-green !bg-neon-green/20 !text-white" : ""}`}>🎮 چندنفره</button>
        <select value={sort} onChange={(e) => apply({ sort: e.target.value })} className="input !w-auto !py-2 !text-sm">
          <option value="rating">محبوب‌ترین</option>
          <option value="price">ارزان‌ترین</option>
          <option value="new">جدیدترین</option>
        </select>
      </div>
    </div>
  );
}
