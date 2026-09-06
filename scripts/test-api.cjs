const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();
const BASE = process.env.BASE ?? "http://localhost:3000";

(async () => {
  let failed = 0;
  const check = (name, cond, extra = "") => {
    if (cond) console.log(`  ok  ${name} ${extra}`);
    else { failed++; console.log(`FAIL  ${name} ${extra}`); }
  };
  const j = async (path, method = "GET", body, headers = {}) => {
    const res = await fetch(BASE + path, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    let data;
    try { data = await res.json(); } catch { data = await res.text(); }
    return { status: res.status, data };
  };

  console.log("== Public API ==");
  const station = await db.station.findFirst({ where: { type: "PC" } });
  const av = await j(`/api/booking/availability?stationId=${station.id}&date=2026-09-10`);
  check("availability", av.status === 200, `${Object.keys(av.data.taken ?? {}).length} hours`);
  check("availability privacy (no names)", !JSON.stringify(av.data).includes("name"));

  const dc = await j("/api/discount/check", "POST", { code: "WELCOME10" });
  check("discount valid", dc.status === 200 && dc.data.valid === true);

  const dcbad = await j("/api/discount/check", "POST", { code: "NOPE" });
  check("discount invalid", dcbad.data.valid === false);

  const bk = await j("/api/booking", "POST", { stationId: station.id, date: "2026-09-10", startHour: 10, hours: 2, payMethod: "onsite", guestName: "تست گیمر", guestPhone: "09121112233" });
  check("guest booking", bk.status === 200, `total=${bk.data.total}`);

  const dup = await j("/api/booking", "POST", { stationId: station.id, date: "2026-09-10", startHour: 10, hours: 2, payMethod: "onsite", guestName: "تست", guestPhone: "09121112233" });
  check("booking conflict (409)", dup.status === 409);

  const badPhone = await j("/api/booking", "POST", { stationId: station.id, date: "2026-09-10", startHour: 20, hours: 2, payMethod: "onsite", guestName: "تست", guestPhone: "0912" });
  check("guest booking bad phone (400)", badPhone.status === 400);

  const pastDate = await j("/api/booking", "POST", { stationId: station.id, date: "2020-01-01", startHour: 10, hours: 2, payMethod: "onsite", guestName: "تست", guestPhone: "09121112233" });
  check("past date rejected (400)", pastDate.status === 400);

  const lateHours = await j("/api/booking", "POST", { stationId: station.id, date: "2026-09-10", startHour: 22, hours: 8, payMethod: "onsite", guestName: "تست", guestPhone: "09121112233" });
  check("out of work hours rejected (400)", lateHours.status === 400);

  console.log("== Auth ==");
  const reg = await j("/api/auth/register", "POST", { name: "کاربر جدید", username: "newuser1", email: "new1@example.com", phone: "09129998877", password: "test1234", referral: "REF-arash" });
  check("register + referral", reg.status === 200);

  const regDup = await j("/api/auth/register", "POST", { name: "دوباره", username: "newuser1", email: "new1@example.com", password: "test1234" });
  check("register dup (409)", regDup.status === 409);

  const regUpper = await j("/api/auth/register", "POST", { name: "کیس", username: "Newuser1", email: "x@example.com", password: "test1234" });
  check("register dup case-insensitive (409)", regUpper.status === 409);

  const regWeak = await j("/api/auth/register", "POST", { name: "ضعیف", username: "weakpw", email: "w@example.com", password: "123" });
  check("weak password (400)", regWeak.status === 400);

  console.log("== Validation ==");
  const ct = await j("/api/contact", "POST", { name: "علی", email: "ali@x.com", phone: "", subject: "تست تماس", message: "سلام این یک پیام تستی است" });
  check("contact", ct.status === 200);

  const ctBad = await j("/api/contact", "POST", { name: "ع", email: "not-an-email", subject: "", message: "" });
  check("contact invalid (400)", ctBad.status === 400);

  console.log("== CSRF / headers ==");
  const csrf = await j("/api/contact", "POST", { name: "هکر", email: "h@x.com", subject: "X", message: "xxxxxxxxxxxx" }, { Origin: "https://evil.example.com", "Content-Type": "application/json" });
  check("cross-origin POST blocked (403)", csrf.status === 403);

  console.log("== Pages ==");
  for (const p of ["/", "/games", "/booking", "/tournaments", "/pricing", "/blog", "/leaderboard", "/sitemap.xml", "/robots.txt", "/login", "/register", "/forgot-password"]) {
    const r = await fetch(BASE + p);
    check(`page ${p}`, r.status === 200);
  }
  const nf = await fetch(BASE + "/does-not-exist");
  check("404 page", nf.status === 404);

  const dash = await fetch(BASE + "/dashboard", { redirect: "manual" });
  check("/dashboard unauth redirect", dash.status >= 300 && dash.status < 400);
  const admin = await fetch(BASE + "/admin", { redirect: "manual" });
  check("/admin unauth redirect", admin.status >= 300 && admin.status < 400);

  const hdrs = await fetch(BASE + "/");
  check("security headers", hdrs.headers.get("x-frame-options") === "DENY" && hdrs.headers.get("x-content-type-options") === "nosniff");

  console.log(failed === 0 ? "\n✅ ALL TESTS PASSED" : `\n❌ ${failed} TESTS FAILED`);
  await db.$disconnect();
  process.exit(failed === 0 ? 0 : 1);
})();
