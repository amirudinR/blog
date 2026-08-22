import { NextResponse } from "next/server";
import { z } from "zod";

import { incrementViews } from "@/lib/db/queries";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  postId: z.uuid(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`views:${ip}`, 30, 60_000);
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
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  try {
    await incrementViews(parsed.data.postId);
  } catch {
    return NextResponse.json({ error: "Failed to count view" }, { status: 400 });
  }

  return new NextResponse(null, { status: 204 });
}
