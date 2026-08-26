"use client";

import { Pause, Play, RotateCcw, Square } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Locale } from "@/lib/i18n/config";

import { buildSpeechChunks } from "@/lib/utils/blog";

type TextToSpeechLabels = {
  listen: string;
  pause: string;
  resume: string;
  stop: string;
  speed: string;
  partOf: string;
  voice: string;
  arabicVoice: string;
  auto: string;
  restart: string;
};

type TextToSpeechProps = {
  text: string;
  locale: Locale;
  storageKey: string;
  labels: TextToSpeechLabels;
};

type WakeLockLike = { release: () => Promise<void> };
type WakeLockApi = { request: (type: "screen") => Promise<WakeLockLike> };

const SPEEDS = [0.75, 1, 1.25, 1.5];

function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function wakeLockApi(): WakeLockApi | null {
  if (typeof navigator === "undefined") return null;
  const api = (navigator as Navigator & { wakeLock?: WakeLockApi }).wakeLock;
  return api ?? null;
}

export function TextToSpeech({ text, locale, storageKey, labels }: TextToSpeechProps) {
  const chunks = useMemo(() => buildSpeechChunks(text), [text]);
  const hasArabicContent = useMemo(() => chunks.some((chunk) => chunk.arabic), [chunks]);

  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [index, setIndex] = useState(0);
  const [rate, setRateState] = useState(1);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [mainVoice, setMainVoice] = useState("");
  const [arabVoice, setArabVoice] = useState("");
  const [resumeFrom, setResumeFrom] = useState<number | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wakeLockRef = useRef<WakeLockLike | null>(null);
  const indexRef = useRef(0);
  const statusRef = useRef<"idle" | "playing" | "paused">("idle");
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const mainVoiceRef = useRef("");
  const arabVoiceRef = useRef("");
  const rateRef = useRef(1);

  const mainVoiceStorageKey = `blogkutts.voice.${locale}`;
  const arabVoiceStorageKey = "blogkutts.voice.ar";
  const rateStorageKey = "blogkutts.rate";
  const progressStorageKey = `blogkutts.progress.${storageKey}`;

  useEffect(() => {
    voicesRef.current = voices;
  }, [voices]);
  useEffect(() => {
    mainVoiceRef.current = mainVoice;
  }, [mainVoice]);
  useEffect(() => {
    arabVoiceRef.current = arabVoice;
  }, [arabVoice]);
  useEffect(() => {
    rateRef.current = rate;
  }, [rate]);

  const saveProgress = useCallback(
    (position: number) => {
      try {
        window.localStorage.setItem(
          progressStorageKey,
          JSON.stringify({ i: position, total: chunks.length })
        );
      } catch {
        return;
      }
    },
    [progressStorageKey, chunks.length]
  );

  const clearProgress = useCallback(() => {
    try {
      window.localStorage.removeItem(progressStorageKey);
    } catch {
      return;
    }
  }, [progressStorageKey]);

  const acquireWakeLock = useCallback(async () => {
    try {
      const api = wakeLockApi();
      if (!api || wakeLockRef.current) return;
      wakeLockRef.current = await api.request("screen");
    } catch {
      return;
    }
  }, []);

  const releaseWakeLock = useCallback(() => {
    const lock = wakeLockRef.current;
    wakeLockRef.current = null;
    if (lock) void lock.release().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!speechSupported()) return;
    const synth = window.speechSynthesis;
    const loadVoices = () => setVoices(synth.getVoices());
    const applyPersisted = () => {
      loadVoices();
      try {
        const savedMain = window.localStorage.getItem(mainVoiceStorageKey);
        if (savedMain) {
          setMainVoice(savedMain);
          mainVoiceRef.current = savedMain;
        }
        const savedArab = window.localStorage.getItem(arabVoiceStorageKey);
        if (savedArab) {
          setArabVoice(savedArab);
          arabVoiceRef.current = savedArab;
        }
        const savedRate = Number(window.localStorage.getItem(rateStorageKey));
        if (SPEEDS.includes(savedRate)) {
          setRateState(savedRate);
          rateRef.current = savedRate;
        }
        const savedProgress = JSON.parse(
          window.localStorage.getItem(progressStorageKey) ?? "null"
        ) as { i?: number; total?: number } | null;
        if (
          savedProgress &&
          typeof savedProgress.i === "number" &&
          savedProgress.total === chunks.length &&
          savedProgress.i > 0 &&
          savedProgress.i < chunks.length
        ) {
          setResumeFrom(savedProgress.i);
        }
      } catch {
        return;
      }
    };
    const timer = window.setTimeout(applyPersisted, 0);
    synth.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.clearTimeout(timer);
      synth.removeEventListener("voiceschanged", loadVoices);
      if (statusRef.current !== "idle") saveProgress(indexRef.current);
      utteranceRef.current = null;
      synth.cancel();
      const lock = wakeLockRef.current;
      wakeLockRef.current = null;
      if (lock) void lock.release().catch(() => undefined);
    };
  }, [
    arabVoiceStorageKey,
    chunks.length,
    mainVoiceStorageKey,
    progressStorageKey,
    rateStorageKey,
    saveProgress,
  ]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && statusRef.current === "playing") {
        void acquireWakeLock();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [acquireWakeLock]);

  function pickVoiceFor(chunkArabic: boolean): {
    voice: SpeechSynthesisVoice | null;
    lang: string;
  } {
    const list = voicesRef.current;
    if (chunkArabic) {
      const chosen = list.find((candidate) => candidate.voiceURI === arabVoiceRef.current);
      const fallback = list.find((candidate) =>
        candidate.lang.toLowerCase().startsWith("ar")
      );
      return { voice: chosen ?? fallback ?? null, lang: "ar-SA" };
    }
    const chosen = list.find((candidate) => candidate.voiceURI === mainVoiceRef.current);
    const prefix = locale === "id" ? "id" : "en";
    const fallback = list.find((candidate) =>
      candidate.lang.toLowerCase().replace("_", "-").startsWith(prefix)
    );
    return { voice: chosen ?? fallback ?? null, lang: prefix === "id" ? "id-ID" : "en-US" };
  }

  function finish() {
    utteranceRef.current = null;
    clearProgress();
    setResumeFrom(null);
    indexRef.current = 0;
    setIndex(0);
    statusRef.current = "idle";
    setStatus("idle");
    releaseWakeLock();
  }

  function halt() {
    utteranceRef.current = null;
    if (speechSupported()) window.speechSynthesis.cancel();
    statusRef.current = "idle";
    setStatus("idle");
    setResumeFrom(indexRef.current > 0 ? indexRef.current : null);
    releaseWakeLock();
  }

  function speakFrom(start: number, playbackRate: number) {
    if (!speechSupported()) return;
    if (start >= chunks.length) {
      finish();
      return;
    }
    const synth = window.speechSynthesis;
    synth.cancel();
    const chunk = chunks[start];
    const { voice, lang } = pickVoiceFor(chunk.arabic);
    const utterance = new SpeechSynthesisUtterance(chunk.text);
    utterance.lang = lang;
    utterance.rate = playbackRate;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      if (utteranceRef.current !== utterance) return;
      speakFrom(start + 1, playbackRate);
    };
    utterance.onerror = () => {
      if (utteranceRef.current !== utterance) return;
      finish();
    };
    utteranceRef.current = utterance;
    indexRef.current = start;
    setIndex(start);
    statusRef.current = "playing";
    setStatus("playing");
    saveProgress(start);
    void acquireWakeLock();
    synth.speak(utterance);
  }

  function toggle() {
    if (!speechSupported()) return;
    if (status === "playing") {
      window.speechSynthesis.pause();
      statusRef.current = "paused";
      setStatus("paused");
      releaseWakeLock();
      return;
    }
    if (status === "paused") {
      window.speechSynthesis.resume();
      statusRef.current = "playing";
      setStatus("playing");
      void acquireWakeLock();
      return;
    }
    speakFrom(resumeFrom ?? 0, rateRef.current);
  }

  function restart() {
    clearProgress();
    setResumeFrom(null);
    speakFrom(0, rateRef.current);
  }

  function changeRate(value: number) {
    setRateState(value);
    rateRef.current = value;
    try {
      window.localStorage.setItem(rateStorageKey, String(value));
    } catch {
      return;
    }
    if (status !== "idle") speakFrom(indexRef.current, value);
  }

  function changeMainVoice(uri: string) {
    setMainVoice(uri);
    mainVoiceRef.current = uri;
    try {
      window.localStorage.setItem(mainVoiceStorageKey, uri);
    } catch {
      return;
    }
  }

  function changeArabVoice(uri: string) {
    setArabVoice(uri);
    arabVoiceRef.current = uri;
    try {
      window.localStorage.setItem(arabVoiceStorageKey, uri);
    } catch {
      return;
    }
  }

  if (chunks.length === 0) return null;

  const active = status !== "idle";
  const localePrefix = locale === "id" ? "id" : "en";
  const localeVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().replace("_", "-").startsWith(localePrefix)
  );
  const arabVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("ar")
  );
  const shownIndex = active ? index : resumeFrom ?? 0;
  const primaryLabel =
    status === "playing"
      ? labels.pause
      : status === "paused"
        ? labels.resume
        : resumeFrom !== null
          ? labels.resume
          : labels.listen;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
      >
        {status === "playing" ? (
          <Pause className="size-4" aria-hidden />
        ) : (
          <Play className="size-4" aria-hidden />
        )}
        {primaryLabel}
      </button>

      {active && (
        <button
          type="button"
          onClick={halt}
          aria-label={labels.stop}
          title={labels.stop}
          className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Square className="size-4" aria-hidden />
        </button>
      )}

      {!active && resumeFrom !== null && (
        <button
          type="button"
          onClick={restart}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          {labels.restart}
        </button>
      )}

      <label className="inline-flex min-h-[44px] items-center">
        <span className="sr-only">{labels.speed}</span>
        <select
          value={rate}
          onChange={(event) => changeRate(Number(event.target.value))}
          className="h-11 cursor-pointer rounded-full border border-border/70 bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {SPEEDS.map((speed) => (
            <option key={speed} value={speed}>
              {speed}×
            </option>
          ))}
        </select>
      </label>

      <label className="inline-flex min-h-[44px] items-center">
        <span className="sr-only">{labels.voice}</span>
        <select
          value={mainVoice}
          onChange={(event) => changeMainVoice(event.target.value)}
          title={labels.voice}
          className="h-11 max-w-[10rem] cursor-pointer rounded-full border border-border/70 bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:max-w-none"
        >
          <option value="">{labels.auto}</option>
          {localeVoices.map((voice) => (
            <option key={voice.voiceURI} value={voice.voiceURI}>
              {voice.name}
            </option>
          ))}
        </select>
      </label>

      {hasArabicContent && (
        <label className="inline-flex min-h-[44px] items-center">
          <span className="sr-only">{labels.arabicVoice}</span>
          <select
            value={arabVoice}
            onChange={(event) => changeArabVoice(event.target.value)}
            title={labels.arabicVoice}
            className="h-11 max-w-[10rem] cursor-pointer rounded-full border border-border/70 bg-card px-3 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:max-w-none"
          >
            <option value="">{labels.auto}</option>
            {arabVoices.map((voice) => (
              <option key={voice.voiceURI} value={voice.voiceURI}>
                {voice.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {(active || resumeFrom !== null) && (
        <span
          className="text-xs tabular-nums text-muted-foreground"
          aria-live="polite"
        >
          {labels.partOf
            .replace("{current}", String(shownIndex + 1))
            .replace("{total}", String(chunks.length))}
        </span>
      )}
    </div>
  );
}
