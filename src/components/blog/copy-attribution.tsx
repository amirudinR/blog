"use client";

import type { ReactNode } from "react";

type CopyAttributionProps = {
  url: string;
  siteName: string;
  children: ReactNode;
};

export function CopyAttribution({ url, siteName, children }: CopyAttributionProps) {
  return (
    <div
      onCopy={(e) => {
        const selection = window.getSelection()?.toString() ?? "";
        if (!selection || selection.length <= 40) return;
        e.preventDefault();
        const enriched = `${selection}\n\nSumber: ${siteName}\n${url}`;
        e.clipboardData?.setData("text/plain", enriched);
      }}
    >
      {children}
    </div>
  );
}
