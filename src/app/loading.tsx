export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-24">
      <div className="mx-auto grid max-w-3xl animate-pulse gap-4">
        <div className="h-10 w-56 rounded-xl bg-white/5" />
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-4/5 rounded bg-white/5" />
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="h-28 rounded-2xl bg-white/5" />
          <div className="h-28 rounded-2xl bg-white/5" />
          <div className="h-28 rounded-2xl bg-white/5" />
        </div>
      </div>
      <p className="mt-10 text-center text-xs text-slate-600">در حال بارگذاری…</p>
    </div>
  );
}
