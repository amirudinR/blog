type StatusConfig = {
  label: string;
  className: string;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  published: {
    label: "Terpublikasi",
    className:
      "bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]",
  },
  draft: {
    label: "Draft",
    className:
      "bg-[var(--md-surface-container-highest)] text-[var(--md-on-surface-variant)]",
  },
  scheduled: {
    label: "Terjadwal",
    className:
      "bg-[var(--md-primary-container)] text-[var(--md-on-primary-container)]",
  },
  approved: {
    label: "Disetujui",
    className:
      "bg-[var(--md-tertiary-container)] text-[var(--md-on-tertiary-container)]",
  },
  pending: {
    label: "Pending",
    className:
      "bg-[var(--md-secondary-container)] text-[var(--md-on-secondary-container)]",
  },
  rejected: {
    label: "Ditolak",
    className:
      "bg-[var(--md-error-container)] text-[var(--md-on-error-container)]",
  },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {status === "pending" && (
        <span
          aria-hidden
          className="size-1.5 animate-pulse rounded-full bg-current"
        />
      )}
      {config.label}
    </span>
  );
}
