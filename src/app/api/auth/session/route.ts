import { NextResponse, type NextRequest } from "next/server";

import { getAdminAuth, verifyIdToken } from "@/lib/firebase/admin";

const SESSION_COOKIE = "blog_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_EXPIRES_IN_MS = 60 * 60 * 24 * 7 * 1000;

export async function POST(request: NextRequest) {
  let body: { idToken?: string };
  try {
    body = (await request.json()) as { idToken?: string };
  } catch {
    return NextResponse.json({ error: "Body JSON tidak valid" }, { status: 400 });
  }

  const idToken = body.idToken;
  if (!idToken || typeof idToken !== "string") {
    return NextResponse.json({ error: "idToken wajib diisi" }, { status: 400 });
  }

  const user = await verifyIdToken(idToken);
  if (!user) {
    return NextResponse.json({ error: "ID token tidak valid" }, { status: 401 });
  }

  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !adminEmails.includes(user.email.trim().toLowerCase())) {
    return NextResponse.json({ error: "Email tidak diizinkan" }, { status: 403 });
  }

  try {
    const sessionCookieValue = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRES_IN_MS,
    });

    const response = NextResponse.json({ ok: true, email: user.email });
    response.cookies.set(SESSION_COOKIE, sessionCookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: "Gagal membuat sesi" },
      { status: 401 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
