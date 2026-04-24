"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Rec = any;

function createRecognition(): Rec | null {
  if (typeof window === "undefined") return null;
  const Ctor = (window as unknown as { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec })
    .SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => Rec }).webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

type Props = {
  /** Final transcript → parent should send to chat API. */
  onTranscript: (text: string) => void;
  onListeningChange?: (listening: boolean) => void;
  disabled?: boolean;
};

export function VoiceButton({ onTranscript, onListeningChange, disabled }: Props) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const recRef = useRef<Rec | null>(null);

  useEffect(() => {
    setSupported(Boolean(createRecognition()));
  }, []);

  useEffect(() => {
    onListeningChange?.(listening);
  }, [listening, onListeningChange]);

  const toggle = useCallback(() => {
    if (disabled || !supported) return;
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = createRecognition();
    if (!rec) return;
    recRef.current = rec;
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "en-US";
    rec.onresult = (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
      const text = event.results[0][0].transcript?.trim();
      if (text) onTranscript(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    try {
      rec.start();
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [disabled, listening, onTranscript, supported]);

  if (!supported) {
    return (
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-300 text-[10px] text-zinc-400 dark:border-zinc-600"
        title="Voice input not supported in this browser"
      >
        —
      </span>
    );
  }

  return (
    <button
      type="button"
      title={listening ? "Stop listening" : "Speak — converts to text and sends to chat"}
      aria-label={listening ? "Stop voice input" : "Start voice input"}
      aria-pressed={listening}
      disabled={disabled}
      onClick={toggle}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold transition ${
        listening
          ? "border-red-400 bg-red-50 text-red-600 ring-2 ring-red-200 dark:border-red-500/50 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900/50"
          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-emerald-500/40"
      } disabled:opacity-40`}
    >
      {listening ? "Stop" : "Mic"}
    </button>
  );
}
