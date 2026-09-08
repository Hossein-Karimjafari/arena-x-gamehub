"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { GRADIENTS } from "@/lib/constants";

export default function CoverArt({
  emoji,
  src,
  gradient = "purple",
  title,
  className = "",
  big = false,
  imgStyle,
  children,
  alt,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: {
  emoji: string;
  src?: string;
  gradient?: string;
  title?: string;
  className?: string;
  big?: boolean;
  imgStyle?: CSSProperties;
  children?: ReactNode;
  alt?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const g = GRADIENTS[gradient] ?? GRADIENTS.purple;
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(src) && !failed;
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${g} ${className}`}>
      {showImg ? (
        <>
          <Image
            src={src as string}
            alt={alt ?? title ?? emoji}
            fill
            sizes={sizes}
            className="object-cover"
            style={imgStyle}
            priority={priority}
            onError={() => setFailed(true)}
          />
          {children}
        </>
      ) : (
        <>
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 20%, rgba(255,255,255,.35), transparent 50%)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(0,0,0,.06) 0 2px, transparent 2px 14px)" }} />
          <div className="absolute inset-0 grid place-items-center">
            <span className={big ? "text-8xl drop-shadow-2xl" : "text-6xl drop-shadow-xl"}>{emoji}</span>
          </div>
          {children}
        </>
      )}
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <p className="truncate text-sm font-bold text-white">{title}</p>
        </div>
      )}
    </div>
  );
}
