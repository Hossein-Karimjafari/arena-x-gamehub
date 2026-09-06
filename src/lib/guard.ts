import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** ADMIN or OPERATOR — for read/content management */
export async function requireStaff() {
  const s = await getServerSession(authOptions);
  return s && (s.user.role === "ADMIN" || s.user.role === "OPERATOR") ? s : null;
}

/** ADMIN only — for destructive ops (delete) and role changes */
export async function requireAdmin() {
  const s = await getServerSession(authOptions);
  return s && s.user.role === "ADMIN" ? s : null;
}
