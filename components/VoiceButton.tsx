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
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#e0f2fe] text-[10px] text-[#94a3b8]"
        title="Voice input not supported in this browser (try Chrome, Edge, or Safari)"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="3" width="6" height="11" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
          <line x1="4" y1="4" x2="20" y2="20" />
        </svg>
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
      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
        listening
          ? "border-red-400 bg-red-50 text-red-600 ring-2 ring-red-200"
          : "border-[#e0f2fe] bg-[#f0f9ff] text-[#0ea5e9] hover:border-[#06b6d4] hover:bg-[#ecfeff]"
      } disabled:opacity-40`}
    >
      {listening && (
        <span className="absolute inset-0 animate-ping rounded-xl bg-red-300/40" aria-hidden />
      )}
      <svg className="relative h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <line x1="12" y1="18" x2="12" y2="21" />
        <line x1="9" y1="21" x2="15" y2="21" />
      </svg>
    </button>
  );
}
