import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db, posts } from "@/lib/db";
import { createComment } from "@/lib/db/queries";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  postId: z.uuid(),
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().toLowerCase().pipe(z.email()),
  content: z.string().min(1).max(2000),
  website: z.string().optional(),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success } = rateLimit(`comments:${ip}`, 3, 60_000);
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

  const { postId, name, email, content, website } = parsed.data;

  if (website && website.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  try {
    const existing = await db
      .select({ id: posts.id })
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.status, "published")))
      .limit(1);

    if (!existing[0]) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    await createComment({
      postId,
      authorName: name,
      authorEmail: email,
      content,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create comment" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
