"use client";

import { useEffect } from "react";

import { pushRecent } from "@/lib/reading";

type ReadingTrackerProps = {
  href: string;
  title: string;
};

export function ReadingTracker({ href, title }: ReadingTrackerProps) {
  useEffect(() => {
    pushRecent({ href, title });
  }, [href, title]);
  return null;
}
