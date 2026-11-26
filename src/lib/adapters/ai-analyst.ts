import { getDb } from "@/lib/db";
import { SEED_FILING_CHUNKS } from "@/lib/seed/fundamentals";
import { normalizeSymbol } from "@/lib/seed/universe";
import { FilingChunk, LangCode } from "@/lib/types";

export function ensureFilingChunksIndexed(): void {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(*) as cnt FROM filing_chunks")
    .get() as { cnt: number };
  if (row.cnt >= SEED_FILING_CHUNKS.length) return;

  const upsert = db.prepare(`
    INSERT OR IGNORE INTO filing_chunks (id, symbol, doc_title, section_label, citation_key, fiscal_period, published_date, text)
    VALUES (@id, @symbol, @docTitle, @sectionLabel, @citationKey, @fiscalPeriod, @publishedDate, @text)
  `);
  const tx = db.transaction((chunks: FilingChunk[]) => {
    for (const c of chunks) upsert.run(c);
  });
  tx(SEED_FILING_CHUNKS);
}

export function getChunksForSymbol(symbol: string): FilingChunk[] {
  ensureFilingChunksIndexed();
  const db = getDb();
  const sym = normalizeSymbol(symbol);
  const rows = db
    .prepare(
      `SELECT id, symbol, doc_title as docTitle, section_label as sectionLabel,
              citation_key as citationKey, fiscal_period as fiscalPeriod,
              published_date as publishedDate, text
       FROM filing_chunks
       WHERE symbol = ?
       ORDER BY published_date DESC`
    )
    .all(sym) as FilingChunk[];
  return rows;
}

export interface AnalystChatInput {
  symbol: string;
  question: string;
  lang?: LangCode;
  provider?: "local" | "ollama" | "openai" | "anthropic";
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  valuationSummary?: string;
}

export interface AnalystChatResult {
  answer: string;
  citations: FilingChunk[];
  providerUsed: string;
}

function selectRelevantChunks(
  chunks: FilingChunk[],
  question: string
): FilingChunk[] {
  const q = question.toLowerCase();
  const tokens = q.split(/[^a-z0-9àèéìòù]+/).filter((t) => t.length >= 2);

  const scored = chunks.map((chunk) => {
    const hay = `${chunk.docTitle} ${chunk.fiscalPeriod} ${chunk.text}`.toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      if (hay.includes(tok)) score += 2;
    }
    if (
      (q.includes("red flag") || q.includes("critic") || q.includes("risch")) &&
      (hay.includes("risk") ||
        hay.includes("declin") ||
        hay.includes("pressur") ||
        hay.includes("concentr") ||
        hay.includes("regulator"))
    ) {
      score += 4;
    }
    if (
      (q.includes("tone") || q.includes("tono")) &&
      (hay.includes("tone") || hay.includes("q3") || hay.includes("q4"))
    ) {
      score += 4;
    }
    if (
      (q.includes("capex") ||
        q.includes("guidance") ||
        q.includes("investimenti") ||
        q.includes("stima")) &&
      (hay.includes("capex") ||
        hay.includes("capital expenditure") ||
        hay.includes("guid"))
    ) {
      score += 4;
    }
    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((s) => s.chunk);
}

function buildDeterministicRagAnswer(
  symbol: string,
  question: string,
  chunks: FilingChunk[],
  lang: LangCode
): string {
  const notDisclosed =
    lang === "it"
      ? "Non indicato nei documenti indicizzati."
      : "Not disclosed in indexed filings.";

  if (chunks.length === 0) {
    return notDisclosed;
  }

  const q = question.toLowerCase();
  const allText = chunks.map((c) => c.text.toLowerCase()).join(" ");
  const specificMetricChecks = [
    "ceo compensation",
    "ceo salary",
    "dividend per share",
    "r&d headcount",
    "inventory days",
    "scope 3 emissions",
    "tax rate guidance",
    "exact headcount",
    "stipendio ceo",
  ];
  for (const check of specificMetricChecks) {
    if (q.includes(check) && !allText.includes(check.split(" ")[0])) {
      return notDisclosed;
    }
  }

  const top = selectRelevantChunks(chunks, question);
  const c0 = top[0];
  const c1 = top[1];
  const c2 = top[2];

  if (q.includes("red flag") || q.includes("risk") || q.includes("critic") || q.includes("risch")) {
    const bullets = top.slice(0, 3).map((ch) => `- ${ch.text} ${ch.citationKey}`);
    return lang === "it"
      ? `**Segnali di Rischio dai Documenti ${symbol}:**\n\n${bullets.join("\n")}\n\nEventuali altre voci non menzionate: **${notDisclosed}**`
      : `**Key Filing & Transcript Risk Signals for ${symbol}:**\n\n${bullets.join("\n")}\n\nAny unreferenced balance-sheet or segment sub-metrics are **Not disclosed in indexed filings.**`;
  }

  if (
    q.includes("tone") ||
    q.includes("tono") ||
    (q.includes("q3") && q.includes("q4"))
  ) {
    const q3 = chunks.find((c) => c.docTitle.includes("Q3")) ?? c0;
    const q4 = chunks.find((c) => c.docTitle.includes("Q4")) ?? c1 ?? c0;
    return lang === "it"
      ? `**Confronto Tono Management Q3 vs Q4 (${symbol}):**\n\n- **Contesto Q3:** ${q3.text} ${q3.citationKey}\n- **Cambio in Q4:** ${q4.text} ${q4.citationKey}`
      : `**Q3 vs Q4 Management Tone Comparison (${symbol}):**\n\n- **Q3 Baseline:** ${q3.text} ${q3.citationKey}\n- **Q4 Shift:** ${q4.text} ${q4.citationKey}`;
  }

  if (
    q.includes("guidance") ||
    q.includes("capex") ||
    q.includes("investimenti")
  ) {
    const relevant = top.filter(
      (c) =>
        c.text.toLowerCase().includes("guid") ||
        c.text.toLowerCase().includes("capex") ||
        c.text.toLowerCase().includes("capital expenditure")
    );
    const list = relevant.length > 0 ? relevant : top.slice(0, 2);
    return lang === "it"
      ? `**Sintesi Guidance e CapEx (${symbol}):**\n\n${list
          .map((c) => `- ${c.text} ${c.citationKey}`)
          .join("\n")}`
      : `**Guidance & CapEx Summary (${symbol}):**\n\n${list
          .map((c) => `- ${c.text} ${c.citationKey}`)
          .join("\n")}`;
  }

  const lines = [c0, c1, c2]
    .filter(Boolean)
    .map((c) => `- ${c.text} ${c.citationKey}`);
  return lang === "it"
    ? `**Evidenze dai Documenti Indicizzati (${symbol}):**\n\n${lines.join("\n")}`
    : `**Evidence from Indexed ${symbol} Filings & Transcripts:**\n\n${lines.join("\n")}`;
}

export async function runCitationLockedAnalyst(
  input: AnalystChatInput
): Promise<AnalystChatResult> {
  const sym = normalizeSymbol(input.symbol);
  const lang: LangCode = input.lang === "it" ? "it" : "en";
  const allChunks = getChunksForSymbol(sym);
  const relevant = selectRelevantChunks(allChunks, input.question);

  const langDirective =
    lang === "it"
      ? 'Respond fluently in Italian while keeping exact English/original inline citation keys like [Transcript Q3 \'26, ¶14]. If absent, reply: "Non indicato nei documenti indicizzati."'
      : 'Respond in clear English. If absent, reply strictly with: "Not disclosed in indexed filings."';

  const systemPrompt = `You are OpenTerminal's institutional financial analyst.
STRICT ANTI-HALLUCINATION RULES:
1. Only state facts and numbers explicitly present in the provided INDEXED CHUNKS.
2. Every numerical figure or factual claim MUST end with its exact inline citation badge, e.g. [Transcript Q3 '26, ¶14].
3. ${langDirective}
4. Never fabricate or extrapolate financial numbers.

INDEXED CHUNKS FOR ${sym}:
${allChunks.map((c) => `${c.citationKey} (${c.publishedDate}): ${c.text}`).join("\n\n")}
${input.valuationSummary ? `\nCOMPUTED QUANT SUMMARY: ${input.valuationSummary}` : ""}`;

  const provider = input.provider ?? "local";
  if ((provider === "openai" && input.apiKey) || provider === "ollama") {
    const endpoint =
      provider === "ollama"
        ? (input.baseUrl || "http://localhost:11434/v1").replace(/\/$/, "") +
          "/chat/completions"
        : (input.baseUrl || "https://api.openai.com/v1").replace(/\/$/, "") +
          "/chat/completions";
    const model =
      input.model || (provider === "ollama" ? "llama3.1" : "gpt-4o-mini");

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(input.apiKey ? { Authorization: `Bearer ${input.apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.question },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const json = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.message?.content?.trim();
        if (content) {
          return {
            answer: content,
            citations: allChunks,
            providerUsed:
              provider === "ollama"
                ? `Ollama (${model})`
                : `OpenAI-Compatible (${model})`,
          };
        }
      }
    } catch {
      // Fall through to deterministic local RAG
    }
  }

  if (provider === "anthropic" && input.apiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": input.apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: input.model || "claude-3-5-sonnet-latest",
          max_tokens: 700,
          temperature: 0.1,
          system: systemPrompt,
          messages: [{ role: "user", content: input.question }],
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const json = (await res.json()) as {
          content?: Array<{ text?: string }>;
        };
        const content = json.content?.[0]?.text?.trim();
        if (content) {
          return {
            answer: content,
            citations: allChunks,
            providerUsed: `Anthropic (${input.model || "claude-3-5-sonnet"})`,
          };
        }
      }
    } catch {
      // Fall through to deterministic local RAG
    }
  }

  return {
    answer: buildDeterministicRagAnswer(sym, input.question, allChunks, lang),
    citations: relevant.length > 0 ? allChunks : [],
    providerUsed:
      lang === "it" ? "RAG Locale con Citazioni" : "Local Citation-Locked RAG",
  };
}
