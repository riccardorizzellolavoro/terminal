"use client";

import React, { useEffect, useState } from "react";
import { FileCheck2, Send, Settings2, Sparkles, X } from "lucide-react";
import { FilingChunk } from "@/lib/types";

interface AiAnalystDrawerProps {
  open: boolean;
  onClose: () => void;
  symbol: string;
  valuationSummary?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: FilingChunk[];
  providerUsed?: string;
}

const PROMPT_CHIPS = [
  "Scan latest earnings call for red flags",
  "Compare Q3 vs Q4 management tone",
  "Summarize guidance & capex changes",
];

export function AiAnalystDrawer({
  open,
  onClose,
  symbol,
  valuationSummary,
}: AiAnalystDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeChunk, setActiveChunk] = useState<FilingChunk | null>(null);
  const [indexedChunks, setIndexedChunks] = useState<FilingChunk[]>([]);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [provider, setProvider] = useState<
    "local" | "ollama" | "openai" | "anthropic"
  >("local");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("http://localhost:11434/v1");
  const [model, setModel] = useState("");

  useEffect(() => {
    setMessages([]);
    setActiveChunk(null);
    fetch(`/api/analyst?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((json: { chunks?: FilingChunk[] }) => {
        setIndexedChunks(json.chunks ?? []);
      })
      .catch(() => setIndexedChunks([]));
  }, [symbol]);

  const sendQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: q,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/analyst", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          question: q,
          provider,
          apiKey: apiKey || undefined,
          baseUrl: baseUrl || undefined,
          model: model || undefined,
          valuationSummary,
        }),
      });
      const json = (await res.json()) as {
        answer?: string;
        citations?: FilingChunk[];
        providerUsed?: string;
        error?: string;
      };
      const citations = json.citations?.length ? json.citations : indexedChunks;
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: json.answer || json.error || "Not disclosed in indexed filings.",
        citations,
        providerUsed: json.providerUsed,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (citations.length > 0 && json.answer) {
        const matched = citations.find((c) => json.answer!.includes(c.citationKey));
        if (matched) setActiveChunk(matched);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Unable to query analyst engine.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderWithCitations = (text: string, citations: FilingChunk[] = []) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\])/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("[") && part.endsWith("]")) {
        const chunk =
          citations.find((c) => c.citationKey === part) ??
          indexedChunks.find((c) => c.citationKey === part);
        return (
          <button
            key={`${part}-${i}`}
            type="button"
            onClick={() => {
              if (chunk) setActiveChunk(chunk);
            }}
            className={`mx-0.5 inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] transition ${
              activeChunk?.citationKey === part
                ? "bg-[#3B82F6] text-white"
                : "bg-white/[0.08] text-slate-200 hover:bg-white/[0.16]"
            }`}
          >
            {part}
          </button>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (!open) return null;

  return (
    <aside
      aria-label="AI for Finance Analyst Drawer"
      className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[400px] flex-col border-l border-white/[0.08] bg-[#0B0E14] shadow-2xl"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-slate-300" />
          <div>
            <div className="text-sm font-semibold text-white">
              Ask AI · <span className="font-mono">{symbol}</span>
            </div>
            <div className="text-xs text-slate-400">
              {indexedChunks.length} indexed passages
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Configure AI provider"
            onClick={() => setSettingsOpen((v) => !v)}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Close AI Analyst"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {settingsOpen && (
        <div className="space-y-2.5 border-b border-white/[0.06] bg-[#11151E] px-6 py-4 text-xs">
          <div className="font-medium text-slate-300">Inference Backend</div>
          <select
            aria-label="AI Provider"
            value={provider}
            onChange={(e) =>
              setProvider(
                e.target.value as "local" | "ollama" | "openai" | "anthropic"
              )
            }
            className="w-full rounded-lg border border-white/[0.08] bg-[#0B0E14] px-3 py-2 text-white outline-none"
          >
            <option value="local">Local Citation-Locked RAG (Zero-Key)</option>
            <option value="ollama">Local Ollama (http://localhost:11434/v1)</option>
            <option value="openai">OpenAI-Compatible BYOK</option>
            <option value="anthropic">Anthropic Claude BYOK</option>
          </select>

          {provider !== "local" && (
            <div className="space-y-2">
              {(provider === "ollama" || provider === "openai") && (
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={
                    provider === "ollama"
                      ? "http://localhost:11434/v1"
                      : "https://api.openai.com/v1"
                  }
                  className="w-full rounded-lg border border-white/[0.08] bg-[#0B0E14] px-3 py-2 font-mono text-[11px] text-white outline-none"
                />
              )}
              {provider !== "ollama" && (
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API Key (stored in memory only)"
                  className="w-full rounded-lg border border-white/[0.08] bg-[#0B0E14] px-3 py-2 font-mono text-[11px] text-white outline-none"
                />
              )}
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={
                  provider === "ollama"
                    ? "llama3.1"
                    : provider === "anthropic"
                      ? "claude-3-5-sonnet-latest"
                      : "gpt-4o-mini"
                }
                className="w-full rounded-lg border border-white/[0.08] bg-[#0B0E14] px-3 py-2 font-mono text-[11px] text-white outline-none"
              />
            </div>
          )}
        </div>
      )}

      <div className="border-b border-white/[0.06] px-6 py-4">
        <div className="mb-2.5 text-xs text-slate-400">Suggested Prompts</div>
        <div className="flex flex-wrap gap-2">
          {PROMPT_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => sendQuestion(chip)}
              className="rounded-lg bg-[#11151E] px-3 py-1.5 text-left text-xs text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {messages.length === 0 ? (
          <div className="rounded-xl bg-[#11151E] p-4 text-xs leading-relaxed text-slate-400">
            Ask any question grounded in{" "}
            <span className="font-mono text-white">{symbol}</span>&apos;s indexed
            transcripts and 10-K filings. Unindexed figures strictly return{" "}
            <span className="font-mono text-slate-200">
              &quot;Not disclosed in indexed filings.&quot;
            </span>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-4 text-xs leading-relaxed ${
                m.role === "user"
                  ? "ml-6 bg-white/[0.08] text-white"
                  : "bg-[#11151E] text-slate-200"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {m.role === "assistant"
                  ? renderWithCitations(m.content, m.citations)
                  : m.content}
              </div>
              {m.providerUsed && (
                <div className="mt-2 font-mono text-[10px] text-slate-500">
                  {m.providerUsed}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="rounded-xl bg-[#11151E] p-4 text-xs text-slate-400">
            Verifying against indexed filings...
          </div>
        )}

        {activeChunk && (
          <div
            data-testid="citation-snippet-viewer"
            className="rounded-xl border border-white/[0.1] bg-[#11151E] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-white">
                <FileCheck2 className="h-3.5 w-3.5 text-slate-300" />
                {activeChunk.citationKey}
              </div>
              <button
                type="button"
                onClick={() => setActiveChunk(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Hide
              </button>
            </div>
            <div className="mt-1 font-mono text-[11px] text-slate-500">
              {activeChunk.fiscalPeriod} · {activeChunk.publishedDate}
            </div>
            <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-slate-200">
              {activeChunk.text}
            </p>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuestion(input);
        }}
        className="border-t border-white/[0.06] p-4"
      >
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#11151E] px-3 py-2 focus-within:border-white/30">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${symbol} filings...`}
            className="flex-1 bg-transparent text-xs text-white outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send question"
            className="rounded-md bg-[#3B82F6] p-1.5 text-white transition hover:bg-[#2563EB] disabled:opacity-50"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </aside>
  );
}
