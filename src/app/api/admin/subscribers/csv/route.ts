import { listSubscribers } from "@/lib/db/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

function csvEscape(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const subscribers = await listSubscribers();
  const lines = ["email,status,subscribed_at"];
  for (const subscriber of subscribers) {
    lines.push(
      [
        csvEscape(subscriber.email),
        csvEscape(subscriber.status),
        subscriber.subscribedAt.toISOString(),
      ].join(",")
    );
  }

  const csv = `\uFEFF${lines.join("\r\n")}`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="subscribers.csv"',
    },
  });
}
