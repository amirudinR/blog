"use client";

import { CaseSensitive } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const SCALES = [0.875, 1, 1.125, 1.25];
const SCALE_KEY = "blogkutts.fontScale";
const SERIF_KEY = "blogkutts.serif";

type ArticleBodyProps = {
  children: ReactNode;
  labels: { increase: string; decrease: string; serif: string };
};

export function ArticleBody({ children, labels }: ArticleBodyProps) {
  const [scaleIndex, setScaleIndex] = useState(1);
  const [serif, setSerif] = useState(false);

  useEffect(() => {
    const applyPersisted = () => {
      try {
        const savedScale = Number(window.localStorage.getItem(SCALE_KEY));
        const savedIndex = SCALES.indexOf(savedScale);
        if (savedIndex >= 0) setScaleIndex(savedIndex);
        setSerif(window.localStorage.getItem(SERIF_KEY) === "1");
      } catch {
        return;
      }
    };
    const timer = window.setTimeout(applyPersisted, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function changeScale(delta: number) {
    const next = Math.min(SCALES.length - 1, Math.max(0, scaleIndex + delta));
    setScaleIndex(next);
    try {
      window.localStorage.setItem(SCALE_KEY, String(SCALES[next]));
    } catch {
      return;
    }
  }

  function toggleSerif() {
    const next = !serif;
    setSerif(next);
    try {
      window.localStorage.setItem(SERIF_KEY, next ? "1" : "0");
    } catch {
      return;
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="inline-flex items-center overflow-hidden rounded-full border border-border/70 bg-card">
          <button
            type="button"
            onClick={() => changeScale(-1)}
            disabled={scaleIndex === 0}
            aria-label={labels.decrease}
            title={labels.decrease}
            className="flex size-9 items-center justify-center text-xs font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            A−
          </button>
          <span
            className="w-8 text-center text-[11px] tabular-nums text-muted-foreground"
            aria-hidden
          >
            {SCALES[scaleIndex] * 100}%
          </span>
          <button
            type="button"
            onClick={() => changeScale(1)}
            disabled={scaleIndex === SCALES.length - 1}
            aria-label={labels.increase}
            title={labels.increase}
            className="flex size-9 items-center justify-center text-sm font-bold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            A+
          </button>
        </div>
        <button
          type="button"
          onClick={toggleSerif}
          aria-pressed={serif}
          title={labels.serif}
          aria-label={labels.serif}
          className={`inline-flex size-9 items-center justify-center rounded-full border transition-colors ${
            serif
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/70 bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          <CaseSensitive className="size-4" aria-hidden />
        </button>
      </div>
      <div
        style={{ fontSize: `${SCALES[scaleIndex]}rem` }}
        className={serif ? "font-serif" : undefined}
      >
        {children}
      </div>
    </div>
  );
}
