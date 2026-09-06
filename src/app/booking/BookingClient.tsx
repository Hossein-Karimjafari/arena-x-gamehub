"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toman, faNum, WORK_HOURS, PLATFORM_FA } from "@/lib/constants";

type Station = { id: string; name: string; type: string; specs: string; hourlyRate: number; online: boolean; active: boolean };
type Game = { slug: string; title: string; platform: string };

function buildDays() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().slice(0, 10),
      label: new Intl.DateTimeFormat("fa-IR", { weekday: "short" }).format(d),
      day: new Intl.DateTimeFormat("fa-IR", { day: "numeric" }).format(d),
    };
  });
}

function Client({ stations, games }: { stations: Station[]; games: Game[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const sp = useSearchParams();
  const days = useMemo(buildDays, []);
  const preGame = sp.get("game") ?? "";
  const preStation = sp.get("station") ?? "";

  const [type, setType] = useState("");
  const [stationId, setStationId] = useState("");
  const [date, setDate] = useState(days[0].iso);
  const [hours, setHours] = useState(2);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [gameSlug, setGameSlug] = useState(preGame);
  const [payMethod, setPayMethod] = useState("onsite");
  const [discount, setDiscount] = useState("");
  const [discountResult, setDiscountResult] = useState<{ ok: boolean; message: string; percent: number } | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [taken, setTaken] = useState<Record<number, boolean>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const activeStations = useMemo(() => stations.filter((s) => s.active), [stations]);
  const types = useMemo(() => [...new Set(activeStations.map((s) => s.type))], [activeStations]);
  const filtered = type ? activeStations.filter((s) => s.type === type) : activeStations;
  const station = stations.find((s) => s.id === stationId);

  // Sync the type filter when arriving with ?station=
  useEffect(() => {
    if (!preStation) return;
    const st = stations.find((s) => s.id === preStation);
    if (st) {
      setType(st.type);
      setStationId(preStation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preStation]);

  useEffect(() => {
    if (!stationId && filtered.length > 0) setStationId(filtered[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    if (!stationId || !date) return;
    setTaken({});
    setStartHour(null);
    let cancelled = false;
    fetch(`/api/booking/availability?stationId=${stationId}&date=${date}`)
      .then((r) => r.json())
      .then((j) => { if (!cancelled) setTaken(j.taken ?? {}); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [stationId, date]);

  const base = (station?.hourlyRate ?? 0) * hours;
  const discounted = Math.round(base * (1 - (discountResult?.ok ? discountResult.percent : 0) / 100));
  const canPayWallet = session && session.user.balance >= discounted;

  // A slot is unselectable when taken OR when the chosen duration would overlap a taken hour.
  function slotBlocked(h: number) {
    if (taken[h]) return true;
    for (let x = h; x < h + hours; x++) if (taken[x]) return true;
    return false;
  }
  const startBlocked = startHour !== null && slotBlocked(startHour);

  async function checkDiscount() {
    if (!discount.trim()) return;
    const res = await fetch("/api/discount/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: discount }),
    });
    const j = await res.json();
    setDiscountResult(j.valid ? { ok: true, message: `کد اعمال شد: ${j.percent}٪ تخفیف 🎉`, percent: j.percent } : { ok: false, message: j.error ?? "کد نامعتبر است", percent: 0 });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!startHour) return setMsg("لطفاً یک ساعت شروع انتخاب کن");
    if (!session && (!guestName.trim() || !guestPhone.trim())) return setMsg("برای رزرو مهمان، نام و شماره موبایل الزامی است");
    if (!session && !/^09\d{9}$/.test(guestPhone.trim())) return setMsg("شماره موبایل نامعتبر است (مثال: 09123456789)");
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/booking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationId, date, startHour, hours, payMethod, discountCode: discountResult?.ok ? discount : undefined, guestName: session ? undefined : guestName, guestPhone: session ? undefined : guestPhone }),
    });
    const j = await res.json();
    setBusy(false);
    if (res.ok) {
      if (j.payUrl) {
        router.push(j.payUrl); // online payment → gateway (or sandbox simulator)
        return;
      }
      setMsg(`✅ رزرو ثبت شد! کد رهگیری: ${j.bookingId}`);
      setTimeout(() => router.push(session ? "/dashboard" : "/"), 1800);
    } else setMsg("❌ " + (j.error ?? "خطا در ثبت رزرو"));
  }

  const pricePerHour = station?.hourlyRate ?? 0;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {/* Step 1: station */}
        <div className="glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-white"><span className="grid h-7 w-7 place-items-center rounded-lg bg-neon-purple/20 font-display text-sm text-neon-purple">1</span> انتخاب دستگاه</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            {types.map((t) => (
              <button type="button" key={t} onClick={() => { setType(t); setStationId(""); }}
                className={`chip !px-4 !py-2 !text-sm ${type === t ? "!border-neon-purple !bg-neon-purple/20 !text-white" : ""}`}>
                {PLATFORM_FA[t] ?? t}
              </button>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {filtered.map((s) => (
              <button type="button" key={s.id} onClick={() => setStationId(s.id)}
                className={`rounded-xl border p-3 text-right transition-all ${stationId === s.id ? "border-neon-purple bg-neon-purple/15 shadow-neon" : "border-white/10 bg-white/5 hover:border-white/25"}`}>
                <p className="flex items-center justify-between font-bold text-white">
                  {s.name}
                  <span className={`h-2 w-2 rounded-full ${s.online ? "bg-neon-green" : "bg-slate-600"}`} title={s.online ? "آنلاین" : "آفلاین"} />
                </p>
                <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{s.specs}</p>
                <p className="mt-1 text-xs font-bold text-neon-green">{toman(s.hourlyRate)}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: date & hour */}
        <div className="glass p-6">
          <h3 className="mb-4 flex items-center gap-2 font-black text-white"><span className="grid h-7 w-7 place-items-center rounded-lg bg-neon-purple/20 font-display text-sm text-neon-purple">2</span> تاریخ و ساعت</h3>
          <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
            {days.map((d) => (
              <button type="button" key={d.iso} onClick={() => setDate(d.iso)}
                className={`flex w-16 shrink-0 flex-col items-center rounded-xl border py-2.5 transition-all ${date === d.iso ? "border-neon-cyan bg-neon-cyan/15 shadow-neon-cyan" : "border-white/10 bg-white/5"}`}>
                <span className="text-[10px] text-slate-400">{d.label}</span>
                <span className="font-display text-lg font-black text-white">{d.day}</span>
              </button>
            ))}
          </div>
          <p className="mb-3 text-xs text-slate-400">ساعت شروع را انتخاب کن (خاکستری = رزروشده):</p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {WORK_HOURS.map((h) => {
              const isBlocked = slotBlocked(h);
              const conflicts = startHour !== null && h > startHour && h < startHour + hours;
              return (
                <button type="button" key={h} disabled={isBlocked}
                  onClick={() => setStartHour(h)}
                  className={`rounded-lg border py-2 text-sm font-bold transition-all ${
                    isBlocked ? "cursor-not-allowed border-white/5 bg-white/5 text-slate-600 line-through"
                    : conflicts ? "border-neon-purple/40 bg-neon-purple/10 text-neon-purple"
                    : startHour === h ? "border-neon-green bg-neon-green/20 text-white shadow-neon"
                    : "border-white/10 bg-white/5 text-slate-200 hover:border-neon-green/50"}`}>
                  {faNum(h)}:۰۰
                </button>
              );
            })}
          </div>
          {startBlocked && <p className="mt-2 text-xs text-neon-red">⚠️ این بازه با ساعت‌های رزروشده تداخل دارد؛ ساعت دیگری انتخاب کن.</p>}
          <div className="mt-5">
            <label className="label">مدت بازی</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                <button type="button" key={h} onClick={() => setHours(h)}
                  className={`chip !px-4 !py-2 ${hours === h ? "!border-neon-green !bg-neon-green/20 !text-white" : ""}`}>{faNum(h)} ساعت</button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 3: game & guest */}
        <div className="glass space-y-4 p-6">
          <h3 className="mb-2 flex items-center gap-2 font-black text-white"><span className="grid h-7 w-7 place-items-center rounded-lg bg-neon-purple/20 font-display text-sm text-neon-purple">3</span> بازی و اطلاعات</h3>
          <div>
            <label className="label">بازی موردنظر (اختیاری)</label>
            <select value={gameSlug} onChange={(e) => setGameSlug(e.target.value)} className="input">
              <option value="">— بعداً در محل انتخاب می‌کنم —</option>
              {games.filter((g) => !station || g.platform === station.type).map((g) => <option key={g.slug} value={g.slug}>{g.title}</option>)}
            </select>
          </div>
          {!session && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">نام شما *</label><input value={guestName} onChange={(e) => setGuestName(e.target.value)} className="input" placeholder="نام و نام خانوادگی" maxLength={60} /></div>
              <div><label className="label">موبایل *</label><input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="input" placeholder="09xxxxxxxxx" dir="ltr" maxLength={11} /></div>
            </div>
          )}
          {session && <p className="text-xs text-slate-400">رزرو با حساب <b className="text-white">{session.user.name}</b> ثبت می‌شود.</p>}
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:sticky lg:top-24 h-fit space-y-4">
        <div className="glass p-6">
          <h3 className="mb-4 font-black text-white">🧾 خلاصه رزرو</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between"><dt className="text-slate-400">دستگاه</dt><dd className="font-bold text-white">{station?.name ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">تاریخ</dt><dd className="text-white">{new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(new Date(date))}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">ساعت</dt><dd className="text-white">{startHour !== null ? `${faNum(startHour)}:۰۰ تا ${faNum(startHour + hours)}:۰۰` : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-400">مدت</dt><dd className="text-white">{faNum(hours)} ساعت</dd></div>
            <div className="flex justify-between border-t border-white/10 pt-3"><dt className="text-slate-400">نرخ ساعتی</dt><dd className="text-white">{toman(pricePerHour)}</dd></div>
          </dl>

          <div className="mt-4 flex gap-2">
            <input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="کد تخفیف" className="input !py-2 !text-xs" maxLength={32} />
            <button type="button" onClick={checkDiscount} className="btn-outline shrink-0 !px-4 !py-2 !text-xs">اعمال</button>
          </div>
          {discountResult && <p className={`mt-2 text-xs ${discountResult.ok ? "text-neon-green" : "text-neon-red"}`}>{discountResult.message}</p>}

          <div className="mt-4 space-y-2 border-t border-white/10 pt-4 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">جمع</span><span className={discountResult?.ok ? "line-through text-slate-500" : "font-bold text-white"}>{toman(base)}</span></div>
            {discountResult?.ok && <div className="flex justify-between text-neon-green"><span>تخفیف {faNum(discountResult.percent)}٪</span><span>−{toman(base - discounted)}</span></div>}
            <div className="flex justify-between text-lg"><span className="font-bold text-white">قابل پرداخت</span><span className="font-black text-neon-green">{toman(discounted)}</span></div>
          </div>

          <div className="mt-5">
            <label className="label">روش پرداخت</label>
            <div className="space-y-2">
              {[
                { id: "onsite", label: "💳 پرداخت در محل", note: "پرداخت هنگام مراجعه" },
                ...(session ? [{ id: "wallet", label: "👛 کیف پول", note: `موجودی: ${toman(session.user.balance)}` }] : []),
                { id: "online", label: "🏦 پرداخت آنلاین", note: "درگاه امن بانکی (سندباکس)" },
              ].map((p) => (
                <button type="button" key={p.id} onClick={() => setPayMethod(p.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all ${payMethod === p.id ? "border-neon-purple bg-neon-purple/15" : "border-white/10 bg-white/5"}`}>
                  <span className="font-bold text-white">{p.label}</span>
                  <span className="text-[10px] text-slate-400">{p.note}</span>
                </button>
              ))}
            </div>
            {payMethod === "wallet" && !canPayWallet && <p className="mt-2 text-xs text-neon-red">موجودی کافی نیست — <Link href="/dashboard/wallet" className="underline">شارژ کیف پول</Link></p>}
          </div>

          <button disabled={busy || startBlocked} className="btn-neon mt-6 w-full !py-3.5 text-base disabled:opacity-50">
            {busy ? "در حال ثبت..." : "🎮 ثبت رزرو"}
          </button>
          {msg && <p className="mt-3 text-center text-sm text-slate-200">{msg}</p>}
          <p className="mt-3 text-center text-[10px] text-slate-500">پس از ثبت، اعلان تأیید در داشبورد برای شما ارسال می‌شود 📩</p>
        </div>

        <div className="glass p-5 text-xs leading-6 text-slate-400">
          <p className="mb-2 font-bold text-white">📌 نکات</p>
          <p>• لغو رایگان تا ۳ ساعت قبل از شروع رزرو.</p>
          <p>• ۱۰ دقیقه تأخیر = آزاد شدن صندلی.</p>
          <p>• با هر رزرو امتیاز وفاداری می‌گیری 🏅</p>
        </div>
      </div>
    </form>
  );
}

export default function BookingClient(props: { stations: Station[]; games: Game[] }) {
  return (
    <Suspense fallback={<p className="glass p-8 text-center text-slate-400">در حال بارگذاری…</p>}>
      <Client {...props} />
    </Suspense>
  );
}
