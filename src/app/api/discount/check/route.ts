import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bad, safeJson, firstIssue } from "@/lib/api-helpers";
import { discountCheckSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!rateLimit(clientKey(req, "dcheck"), 10, 60_000)) return bad("تلاش بیش از حد", 429);
  const body = await safeJson<unknown>(req);
  const parsed = discountCheckSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ valid: false, error: firstIssue(parsed.error) });
  const code = parsed.data.code.trim().toUpperCase();

  const dc = await db.discount.findUnique({ where: { code } });
  if (!dc || !dc.active || dc.used >= dc.maxUse || (dc.expiresAt && dc.expiresAt < new Date())) {
    return NextResponse.json({ valid: false, error: "کد تخفیف نامعتبر یا منقضی است" });
  }
  return NextResponse.json({ valid: true, percent: dc.percent });
}
