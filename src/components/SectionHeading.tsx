export default function SectionHeading({
  kicker,
  title,
  desc,
  center = true,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={`reveal mb-10 ${center ? "text-center" : ""}`}>
      {kicker && (
        <span className="mb-3 inline-block rounded-full border border-neon-purple/40 bg-neon-purple/10 px-4 py-1 font-display text-[11px] font-bold tracking-[0.25em] text-neon-purple">
          {kicker}
        </span>
      )}
      <h2 className="section-title neon-text">{title}</h2>
      {desc && <p className={`mt-3 max-w-2xl text-sm leading-7 text-slate-400 ${center ? "mx-auto" : ""}`}>{desc}</p>}
    </div>
  );
}
