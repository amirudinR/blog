import { NextResponse } from "next/server";
import { z } from "zod";

import { subscribeNewsletter } from "@/lib/db/queries";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    await subscribeNewsletter(parsed.data.email);
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
