import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/guard";
import { bad, apiError, safeJson } from "@/lib/api-helpers";
import { roleEnum } from "@/lib/validation";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireStaff();
  if (!session) return bad("دسترسی ندارید", 403);
  try {
    const { id } = await params;
    const body = await safeJson<{ balanceAdd?: number; role?: string }>(req);
    if (!body) return bad("بدنه درخواست نامعتبر");

    const data: { balance?: { increment: number }; role?: string } = {};

    if (body.balanceAdd !== undefined && body.balanceAdd !== null) {
      const amount = Math.floor(Number(body.balanceAdd));
      if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000_000) return bad("مبلغ شارژ نامعتبر");
      data.balance = { increment: amount };
    }

    if (body.role !== undefined) {
      // Only full admins may change roles; operators cannot escalate.
      if (session.user.role !== "ADMIN") return bad("تغییر نقش فقط توسط مدیر کل مجاز است", 403);
      const parsed = roleEnum.safeParse(body.role);
      if (!parsed.success) return bad("نقش نامعتبر است");
      if (id === session.user.id && parsed.data !== "ADMIN") return bad("نمی‌توانید نقش خودتان را کاهش دهید");
      data.role = parsed.data;
    }

    if (Object.keys(data).length === 0) return bad("چیزی برای بروزرسانی ارسال نشد");

    const user = await db.user.update({ where: { id }, data });

    if (data.balance) {
      await db.$transaction([
        db.walletTx.create({ data: { userId: id, amount: data.balance.increment, type: "TOPUP", desc: "شارژ توسط پشتیبانی" } }),
        db.notification.create({
          data: { userId: id, title: "کیف پول شارژ شد 👛", body: `${data.balance.increment.toLocaleString("fa-IR")} تومان توسط پشتیبانی به کیف پول شما اضافه شد.` },
        }),
      ]);
    }
    return NextResponse.json({ ok: true, role: user.role, balance: user.balance });
  } catch (e) {
    return apiError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return bad("فقط مدیر کل مجاز است", 403);
  try {
    const { id } = await params;
    if (id === admin.user.id) return bad("حذف حساب خودتان ممکن نیست");
    await db.$transaction([
      db.notification.deleteMany({ where: { userId: id } }),
      db.walletTx.deleteMany({ where: { userId: id } }),
      db.payment.deleteMany({ where: { userId: id } }),
      db.tournamentRegistration.deleteMany({ where: { userId: id } }),
      db.review.deleteMany({ where: { userId: id } }),
      db.booking.deleteMany({ where: { userId: id } }),
      db.user.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e);
  }
}
