import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export function firstIssue(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "اطلاعات نامعتبر است";
}

export async function safeJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

export function apiError(e: unknown) {
  if (e instanceof ApiError) return bad(e.message, e.status);
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2002") return bad("این مقدار قبلاً ثبت شده است (تکراری)", 409);
    if (e.code === "P2025") return bad("رکورد موردنظر یافت نشد", 404);
  }
  console.error("[api]", e);
  return bad("خطای داخلی سرور", 500);
}
