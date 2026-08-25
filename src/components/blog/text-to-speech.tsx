"use client";

import { AudioLines, Pause, Play, Square } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/config";

type TextToSpeechLabels = {
  listen: string;
  pause: string;
  resume: string;
  stop: string;
  speed: string;
  partOf: string;
};

type TextToSpeechProps = {
  text: string;
  locale: Locale;
  labels: TextToSpeechLabels;
};

const CHUNK_SIZE = 240;
const SPEEDS = [0.75, 1, 1.25, 1.5];

function splitIntoChunks(text: string): string[] {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > CHUNK_SIZE) {
      chunks.push(current.trim());
      current = "";
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function TextToSpeech({ text, locale, labels }: TextToSpeechProps) {
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [chunkIndex, setChunkIndex] = useState(0);
  const [rate, setRate] = useState(1);

  const chunks = useMemo(() => splitIntoChunks(text), [text]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (!speechSupported()) return;
      utteranceRef.current = null;
      window.speechSynthesis.cancel();
    };
  }, []);

  function stop() {
    if (!speechSupported()) return;
    utteranceRef.current = null;
    window.speechSynthesis.cancel();
    setStatus("idle");
    setChunkIndex(0);
  }

  function speakFrom(start: number, playbackRate: number) {
    if (!speechSupported()) return;
    if (start >= chunks.length) {
      stop();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(chunks[start]);
    utterance.lang = locale === "id" ? "id-ID" : "en-US";
    utterance.rate = playbackRate;
    const prefix = locale === "id" ? "id" : "en";
    const voice =
      synth
        .getVoices()
        .find((candidate) =>
          candidate.lang.toLowerCase().replace("_", "-").startsWith(prefix)
        ) ?? null;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (utteranceRef.current !== utterance) return;
      speakFrom(start + 1, playbackRate);
    };
    utterance.onerror = () => {
      if (utteranceRef.current !== utterance) return;
      stop();
    };
    utteranceRef.current = utterance;
    setChunkIndex(start);
    setStatus("playing");
    synth.speak(utterance);
  }

  if (chunks.length === 0) return null;

  const active = status !== "idle";

  const toggle = () => {
    if (!speechSupported()) return;
    if (status === "playing") {
      window.speechSynthesis.pause();
      setStatus("paused");
      return;
    }
    if (status === "paused") {
      window.speechSynthesis.resume();
      setStatus("playing");
      return;
    }
    speakFrom(0, rate);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
      >
        {status === "playing" ? (
          <Pause className="size-4" aria-hidden />
        ) : status === "paused" ? (
          <Play className="size-4" aria-hidden />
        ) : (
          <AudioLines className="size-4" aria-hidden />
        )}
        {status === "playing"
          ? labels.pause
          : status === "paused"
            ? labels.resume
            : labels.listen}
      </button>

      {active && (
        <button
          type="button"
          onClick={stop}
          aria-label={labels.stop}
          title={labels.stop}
          className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Square className="size-4" aria-hidden />
        </button>
      )}

      <label className="inline-flex min-h-[44px] items-center gap-2">
        <span className="sr-only">{labels.speed}</span>
        <select
          value={rate}
          onChange={(event) => {
            const value = Number(event.target.value);
            setRate(value);
            if (active) speakFrom(chunkIndex, value);
          }}
          className="h-11 cursor-pointer rounded-full border border-border/70 bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {SPEEDS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}×
            </option>
          ))}
        </select>
      </label>

      {active && (
        <span
          className="text-xs tabular-nums text-muted-foreground"
          aria-live="polite"
        >
          {labels.partOf
            .replace("{current}", String(chunkIndex + 1))
            .replace("{total}", String(chunks.length))}
        </span>
      )}
    </div>
  );
}
