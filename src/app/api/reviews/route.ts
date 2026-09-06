import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { bad, apiError, safeJson, firstIssue, ApiError } from "@/lib/api-helpers";
import { reviewSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return bad("برای ثبت دیدگاه ابتدا وارد شو", 401);
  if (!rateLimit(clientKey(req, "review"), 5, 300_000)) return bad("تلاش بیش از حد", 429);
  try {
    const body = await safeJson<unknown>(req);
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) return bad(firstIssue(parsed.error));
    const { gameId, target, rating, comment } = parsed.data;
    const gid = gameId || null;

    if (gid) {
      const game = await db.game.findUnique({ where: { id: gid }, select: { id: true } });
      if (!game) return bad("بازی یافت نشد", 404);
    }

    // One review per user per game (or per site) — prevents spam.
    const dup = await db.review.findFirst({ where: { userId: session.user.id, gameId: gid } });
    if (dup) return bad("شما قبلاً برای این مورد دیدگاه ثبت کرده‌اید", 409);

    await db.$transaction(async (tx) => {
      await tx.review.create({
        data: { userId: session.user.id, gameId: gid, target: gid ? "GAME" : "SITE", rating, comment, approved: false },
      });
      // Only approved reviews count toward the aggregate rating.
      if (gid) {
        const agg = await tx.review.aggregate({ where: { gameId: gid, approved: true }, _avg: { rating: true } });
        await tx.game.update({ where: { id: gid }, data: { rating: Math.round((agg._avg.rating ?? 0) * 10) / 10 } });
      }
    });

    await db.user.update({ where: { id: session.user.id }, data: { xp: { increment: 30 } } });
    return NextResponse.json({ ok: true, message: "دیدگاه ثبت شد و پس از تایید نمایش داده می‌شود" });
  } catch (e) {
    if (e instanceof ApiError) return bad(e.message, e.status);
    return apiError(e);
  }
}
