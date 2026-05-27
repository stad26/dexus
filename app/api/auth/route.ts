import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "dexus_auth";
const IS_PROD = process.env.NODE_ENV === "production";

export async function POST(request: NextRequest) {
  const { password, action, from } = await request.json();

  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
    return res;
  }

  const expected = process.env.SITE_PASSWORD;
  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE, password, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return res;
}
