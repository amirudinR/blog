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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl font-normal tracking-tight">
              Subscriber
            </h1>
            <span className="inline-flex h-7 items-center rounded-full bg-[var(--md-secondary-container)] px-3 text-xs font-medium text-[var(--md-on-secondary-container)]">
              {new Intl.NumberFormat("id-ID").format(subscribers.length)}
            </span>
          </div>
          <p className="mt-1 text-sm text-[var(--md-on-surface-variant)]">
            Daftar pelanggan newsletter blog kamu.
          </p>
        </div>
        <Button render={<a href="/api/admin/subscribers/csv" download="subscribers.csv" />}>
          <Download data-icon="inline-start" />
          Ekspor CSV
        </Button>
      </div>

      {subscribers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-sm text-[var(--md-on-surface-variant)]">
          <Users className="mb-2 size-8 opacity-50" />
          <p>Belum ada subscriber</p>
          <p className="max-w-xs">
            Pembaca yang berlangganan newsletter akan tampil di sini.
          </p>
        </div>
      ) : (
        <div className="hidden overflow-hidden rounded-2xl border border-[var(--md-outline-variant)] md:block">
          <Table>
            <TableHeader>
              <TableRow>
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
                      <Badge className="bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge className="bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]">
                        Berhenti
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm tabular-nums text-[var(--md-on-surface-variant)]">
                    {formatDate(subscriber.subscribedAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {subscribers.length > 0 && (
        <div className="space-y-3 md:hidden">
          {subscribers.map((subscriber) => (
            <div
              key={subscriber.id}
              className="space-y-1.5 rounded-2xl bg-[var(--md-surface-container-low)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 break-all font-medium">
                  {subscriber.email}
                </p>
                {subscriber.status === "active" ? (
                  <Badge className="shrink-0 bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]">
                    Aktif
                  </Badge>
                ) : (
                  <Badge className="shrink-0 bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]">
                    Berhenti
                  </Badge>
                )}
              </div>
              <p className="text-xs tabular-nums text-[var(--md-on-surface-variant)]">
                {formatDate(subscriber.subscribedAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
