import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .slice(0, 100);
}

export function calculateReadingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingSpeed = 200; // words per minute
  return Math.ceil(words / readingSpeed);
}

export function formatDate(date: Date, locale: "id" | "en"): string {
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

