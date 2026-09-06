import { GRADIENTS } from "@/lib/constants";

export default function CoverArt({
  emoji,
  gradient = "purple",
  title,
  className = "",
  big = false,
}: {
  emoji: string;
  gradient?: string;
  title?: string;
  className?: string;
  big?: boolean;
}) {
  const g = GRADIENTS[gradient] ?? GRADIENTS.purple;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${g} ${className}`}>
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,.35), transparent 50%)" }} />
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,.06) 0 2px, transparent 2px 14px)" }} />
      <div className="absolute inset-0 grid place-items-center">
        <span className={big ? "text-8xl drop-shadow-2xl" : "text-6xl drop-shadow-xl"}>{emoji}</span>
      </div>
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="truncate text-sm font-bold text-white">{title}</p>
        </div>
      )}
    </div>
  );
}
