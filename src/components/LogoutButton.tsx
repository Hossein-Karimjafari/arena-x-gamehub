"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-xl border border-neon-red/40 px-5 py-2.5 text-sm font-bold text-neon-red transition-all hover:bg-neon-red/10"
    >
      خروج از حساب
    </button>
  );
}
