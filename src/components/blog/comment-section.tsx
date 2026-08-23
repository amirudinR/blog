"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import enDict from "@/lib/i18n/dictionaries/en.json";
import idDict from "@/lib/i18n/dictionaries/id.json";
import type { Dictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import type { CommentData } from "@/lib/db/queries";
import { formatDate } from "@/lib/utils/blog";

type CommentSectionProps = {
  postId: string;
  comments: CommentData[];
  locale: Locale;
};

function getCommentsDict(locale: Locale): Dictionary["comments"] {
  return (locale === "id" ? idDict : enDict).comments as Dictionary["comments"];
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const result = parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
  return result || "?";
}

export function CommentSection({
  postId,
  comments,
  locale,
}: CommentSectionProps) {
  const t = getCommentsDict(locale);
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [nameError, setNameError] = useState("");
  const [contentError, setContentError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const content = String(data.get("content") ?? "").trim();
    const website = String(data.get("website") ?? "");

    setNameError(!name ? t.nameRequired : "");
    setContentError(!content ? t.contentRequired : "");
    if (!name || !content) return;

    setStatus("sending");
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, name, email, content, website }),
      });
      if (res.ok) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <h2 className="font-heading text-lg sm:text-xl font-bold tracking-tight">
          {t.title}
        </h2>
        <Badge className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
          {comments.length}
        </Badge>
      </div>

      {comments.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">{t.empty}</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initials(comment.authorName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <p className="font-medium">{comment.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(comment.createdAt, locale)}
                  </p>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm">
                  {comment.content}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{t.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`comment-name-${postId}`}>{t.name}</Label>
                <Input
                  id={`comment-name-${postId}`}
                  name="name"
                  required
                  aria-invalid={Boolean(nameError) || undefined}
                />
                {nameError && (
                  <p className="text-sm text-red-600">{nameError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`comment-email-${postId}`}>{t.email}</Label>
                <Input
                  id={`comment-email-${postId}`}
                  name="email"
                  type="email"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`comment-content-${postId}`}>{t.content}</Label>
              <Textarea
                id={`comment-content-${postId}`}
                name="content"
                rows={4}
                required
                aria-invalid={Boolean(contentError) || undefined}
              />
              {contentError && (
                <p className="text-sm text-red-600">{contentError}</p>
              )}
            </div>
            <input
              type="text"
              name="website"
              className="hidden sr-only absolute"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />
            {status === "success" && (
              <p className="text-sm text-green-600 dark:text-green-400">
                {t.successPending}
              </p>
            )}
            {status === "error" && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {t.error}
              </p>
            )}
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? t.submitting : t.submit}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
