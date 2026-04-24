"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VoiceButton } from "./VoiceButton";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "Can I afford dinner tonight?",
  "How much did I spend on groceries?",
  "How much of my budget is left?",
  "How much can I spend this week?",
  "Should I buy this $150 jacket?",
  "Where can I cut back?",
  "How much will I spend this month?",
];

export function ChatBox() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Ask anything about your demo budget—numbers come from mock data. With OpenRouter configured, replies are formatted for readability (facts stay from the engine).",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();
      const reply = typeof data.reply === "string" ? data.reply : "Something went wrong.";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Network error—try again." }]);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <div className="flex flex-col rounded-2xl border border-emerald-500/20 bg-white/80 shadow-lg shadow-emerald-900/5 backdrop-blur-md dark:border-emerald-400/15 dark:bg-zinc-900/70">
      <div className="border-b border-zinc-200/80 px-4 py-3 dark:border-zinc-700/80">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
          Chat
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-left text-xs text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-950/40"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="max-h-[min(52vh,420px)] space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "ml-8 rounded-2xl rounded-br-md bg-emerald-600 px-4 py-2 text-sm text-white shadow-sm dark:bg-emerald-500"
                : "mr-6 whitespace-pre-wrap rounded-2xl rounded-bl-md border border-zinc-200/80 bg-zinc-50 px-4 py-2 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100"
            }
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="mr-6 flex items-center gap-2 text-sm text-zinc-500">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Thinking…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      {voiceListening && (
        <div className="border-t border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-center text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:text-emerald-200">
          Listening… speak your question — text will be sent to the assistant when you stop.
        </div>
      )}
      <form
        className="flex items-end gap-2 border-t border-zinc-200/80 p-3 dark:border-zinc-700/80"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <VoiceButton
          disabled={loading}
          onListeningChange={setVoiceListening}
          onTranscript={(t) => {
            setInput(t);
            void send(t);
          }}
        />
        <input
          className="min-h-[44px] flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none ring-emerald-500/30 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100"
          placeholder="Ask about your money…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-40 dark:bg-emerald-500 dark:hover:bg-emerald-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}
