import "server-only";

import { cookies } from "next/headers";

import {
  verifySessionCookieValue,
  type AdminSession,
} from "@/lib/firebase/admin";

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get("blog_session")?.value;
  if (!value) return null;
  return verifySessionCookieValue(value);
}
