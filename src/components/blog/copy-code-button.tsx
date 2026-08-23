"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function CopyCodeButton() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  async function handleCopy(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    const wrapper = event.currentTarget.closest("[data-code-block]");
    const pre = wrapper?.querySelector("pre");
    if (!pre) return;

    try {
      await navigator.clipboard.writeText(pre.textContent ?? "");
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="absolute top-2 right-2 inline-flex size-10 items-center justify-center rounded-md border border-border/60 bg-background/80 text-muted-foreground opacity-70 backdrop-blur transition-all hover:bg-muted hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
    >
      <span className="sr-only">Copy code</span>
      {copied ? (
        <Check className="size-4 text-primary" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </button>
  );
}
