"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/lib/i18n/get-dictionary";

type NewsletterFormProps = {
  t: Dictionary["home"];
};

export function NewsletterForm({ t }: NewsletterFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "").trim();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return <p className="text-sm text-green-600 dark:text-green-400">{t.subscribed}</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="email"
          name="email"
          required
          placeholder={t.emailPlaceholder}
          aria-label={t.subscribe}
          className="max-w-xs flex-1"
        />
        <Button type="submit" disabled={status === "sending"} className="sm:w-auto w-full">
          {t.subscribe}
        </Button>
      </div>
      {status === "error" && (
        <p className="mt-2 text-sm text-destructive">{t.subscribeError}</p>
      )}
    </form>
  );
}
