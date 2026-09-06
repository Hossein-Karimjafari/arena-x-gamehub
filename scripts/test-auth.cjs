const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const BASE = process.env.BASE ?? "http://localhost:3000";

// Minimal NextAuth credentials login → session cookie for authenticated API tests.
async function login(identity, password) {
  const page = await fetch(BASE + "/api/auth/csrf");
  const { csrfToken } = await page.json();
  const cookie = page.headers.get("set-cookie").split(";")[0];
  const res = await fetch(BASE + "/api/auth/callback/credentials", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: cookie },
    body: new URLSearchParams({ csrfToken, id: identity, password, json: "true" }),
    redirect: "manual",
  });
  const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [res.headers.get("set-cookie")];
  const sessionCookie = setCookie.map((c) => c.split(";")[0]).filter((c) => c.includes("session-token")).join("; ");
  return sessionCookie || cookie;
}

(async () => {
  let failed = 0;
  const check = (name, cond, extra = "") => {
    if (cond) console.log(`  ok  ${name} ${extra}`);
    else { failed++; console.log(`FAIL  ${name} ${extra}`); }
  };
  const j = (path, method = "GET", body, cookie) =>
    fetch(BASE + path, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    }).then(async (res) => {
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = text; }
      return { status: res.status, data };
    });

  console.log("== User flow (arash) ==");
  const cookie = await login("arash@example.com", "123456");
  check("login session cookie", cookie.includes("session-token"));

  const me = await j("/dashboard", "GET", null, cookie);
  check("dashboard authed (200)", me.status === 200);

  // Topup → sandbox simulator → verify
  const top = await j("/api/wallet/topup", "POST", { amount: 200000 }, cookie);
  check("topup returns payUrl", top.status === 200 && typeof top.data.payUrl === "string");
  const auth = decodeURIComponent(top.data.payUrl.split("authority=")[1] ?? "");
  const ver = await j(`/api/wallet/verify?Authority=${auth}&Status=OK`);
  check("verify redirects success", ver.status === 200 || ver.status === 307 || ver.status === 302);
  const balAfter = await db.user.findFirst({ where: { email: "arash@example.com" } });
  check("balance credited once", balAfter.balance > 0);

  // double-verify must not credit twice
  const ver2 = await j(`/api/wallet/verify?Authority=${auth}&Status=OK`);
  void ver2;
  const balDouble = await db.user.findFirst({ where: { email: "arash@example.com" } });
  check("double verify idempotent", balDouble.balance === balAfter.balance);

  // Book with wallet then cancel with refund (next week so free-cancel window always applies)
  const d = new Date(); d.setDate(d.getDate() + 7);
  const date = d.toISOString().slice(0, 10);
  const station = await db.station.findFirst({ where: { type: "PC" } });
  const bk = await j("/api/booking", "POST", { stationId: station.id, date, startHour: 14, hours: 2, payMethod: "wallet" }, cookie);
  check("wallet booking", bk.status === 200, `total=${bk.data.total}`);
  const b = await db.booking.findFirst({ where: { userId: balAfter.id, date, startHour: 14 } });
  const balBeforeCancel = (await db.user.findUnique({ where: { id: balAfter.id } })).balance;
  const cancel = await j(`/api/booking/${b.id}/cancel`, "POST", null, cookie);
  check("user cancel + refund", cancel.status === 200 && cancel.data.refunded === true);
  const balAfterCancel = (await db.user.findUnique({ where: { id: balAfter.id } })).balance;
  check("refund credited", balAfterCancel === balBeforeCancel + b.totalPrice);

  console.log("== Admin flow ==");
  const adminCookie = await login("admin@arenax.ir", "admin1234");
  const opCookie = await login("operator@arenax.ir", "123456");

  const sCreate = await fetch(BASE + "/api/admin/stations", {
    method: "POST", headers: { Cookie: adminCookie, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ name: "PC-TEST", type: "PC", specs: "test", hourlyRate: "120000" }), redirect: "manual",
  });
  check("admin station create", sCreate.status === 200 || sCreate.status === 303);
  const st = await db.station.findFirst({ where: { name: "PC-TEST" } });

  const sPatch = await j(`/api/admin/stations/${st.id}`, "PATCH", { hourlyRate: 999999, online: true }, adminCookie);
  check("admin station patch", sPatch.status === 200);

  const sDel = await j(`/api/admin/stations/${st.id}`, "DELETE", null, adminCookie);
  check("admin station delete", sDel.status === 200);

  // Operator cannot delete games (ADMIN-only) but can create
  const opDelete = await j("/api/admin/games?id=whatever", "DELETE", null, opCookie);
  check("operator delete forbidden (403)", opDelete.status === 403);

  // Operator cannot change roles
  const someUser = await db.user.findFirst({ where: { role: "USER" } });
  const opRole = await j(`/api/admin/users/${someUser.id}`, "PATCH", { role: "ADMIN" }, opCookie);
  check("operator role change forbidden (403)", opRole.status === 403);

  // Admin mass-assignment blocked
  const ma = await j(`/api/admin/users/${someUser.id}`, "PATCH", { role: "SUPERADMIN", balanceAdd: 1000 }, adminCookie);
  const u = await db.user.findUnique({ where: { id: someUser.id } });
  check("role whitelist (SUPERADMIN rejected)", u.role === "USER");

  // Review moderation (unique per user — use a dedicated fresh user)
  await j("/api/auth/register", "POST", { name: "کاربر ریویو", username: "revuser", email: "rev@example.com", phone: "09127776655", password: "test1234" });
  const revCookie = await login("rev@example.com", "test1234");
  const rev = await j("/api/reviews", "POST", { rating: 4, comment: "دیدگاه تستی برای مدیریت" }, revCookie);
  check("review created (pending)", rev.status === 200);
  const pending = await db.review.findFirst({ where: { comment: "دیدگاه تستی برای مدیریت" } });
  check("review not auto-approved", pending.approved === false);
  const approve = await j("/api/admin/reviews", "PATCH", { id: pending.id, approved: true }, adminCookie);
  check("admin approve review", approve.status === 200);

  console.log("== Notifications ==");
  const readAll = await j("/api/notifications/read", "PATCH", {}, cookie);
  check("mark all read", readAll.status === 200);

  console.log(failed === 0 ? "\n✅ ALL AUTH TESTS PASSED" : `\n❌ ${failed} TESTS FAILED`);
  await db.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
})();
