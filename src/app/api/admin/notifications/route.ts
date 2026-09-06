import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/guard";
import { bad, apiError, safeJson } from "@/lib/api-helpers";

const MAX_BROADCAST = 500;

export async function POST(req: NextRequest) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const body = await safeJson<{ userId?: string; title?: string; body?: string }>(req);
    const title = body?.title?.trim();
    const text = body?.body?.trim();
    if (!title || !text) return bad("عنوان و متن اعلان الزامی است");
    if (title.length > 100 || text.length > 500) return bad("عنوان/متن بیش از حد طولانی است");

    const userId = body?.userId?.trim() ?? "";
    let count = 0;

    if (userId) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) return bad("کاربر یافت نشد", 404);
      await db.notification.create({ data: { userId: user.id, title, body: text } });
      count = 1;
    } else {
      const users = await db.user.findMany({ select: { id: true }, take: MAX_BROADCAST });
      if (users.length === 0) return bad("کاربری برای ارسال وجود ندارد", 400);
      await db.notification.createMany({ data: users.map((u) => ({ userId: u.id, title, body: text })) });
      count = users.length;
    }

    return NextResponse.json({ ok: true, count });
  } catch (e) {
    return apiError(e);
  }
}
