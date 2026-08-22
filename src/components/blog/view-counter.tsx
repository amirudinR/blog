"use client";

import { useEffect } from "react";

type ViewCounterProps = {
  postId: string;
};

export function ViewCounter({ postId }: ViewCounterProps) {
  useEffect(() => {
    const key = `viewed-${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    }).catch(() => {});
  }, [postId]);

  return null;
}
