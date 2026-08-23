import type { Metadata } from "next";
import { Download, Users } from "lucide-react";

import { listSubscribers } from "@/lib/db/queries";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Subscriber",
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function AdminSubscribersPage() {
  const subscribers = await listSubscribers();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Subscriber
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Daftar pelanggan newsletter blog kamu.
          </p>
        </div>
        <Button render={<a href="/api/admin/subscribers/csv" download="subscribers.csv" />}>
          <Download data-icon="inline-start" />
          Ekspor CSV
        </Button>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-card px-5 py-4 ring-1 ring-foreground/10">
        <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Users className="size-5" />
        </span>
        <div>
          <p className="font-heading text-2xl leading-none font-bold tabular-nums">
            {new Intl.NumberFormat("id-ID").format(subscribers.length)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Total subscriber</p>
        </div>
      </div>

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Users className="size-8 text-muted-foreground/50" />
          <p className="text-sm font-medium">Belum ada subscriber</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Pembaca yang berlangganan newsletter akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Subscribe</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="font-medium">
                    {subscriber.email}
                  </TableCell>
                  <TableCell>
                    {subscriber.status === "active" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Berhenti</Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(subscriber.subscribedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
