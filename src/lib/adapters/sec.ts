import { getCachedOrFetch } from "@/lib/db";
import { normalizeSecCompanyFacts } from "@/lib/quant/sec-normalizer";
import { getSeedFinancials, getSeedSecFilings } from "@/lib/seed/fundamentals";
import { TICKER_UNIVERSE } from "@/lib/seed/universe";
import { FinancialPeriodRow, SecFilingItem } from "@/lib/types";
import { secRateLimiter } from "./rate-limiter";

const SEC_HEADERS = {
  "User-Agent": "OpenTerminal/1.0 (local@openterminal.app)",
  Accept: "application/json",
};

const CIK_FALLBACK: Record<string, string> = {
  AAPL: "0000320193",
  NVDA: "0001045810",
  MSFT: "0000789019",
  TSLA: "0001318605",
  AMZN: "0001018724",
  META: "0001326801",
  GOOGL: "0001652044",
  CRM: "0001108524",
  UNH: "0000731766",
};

async function fetchSecJson<T>(url: string): Promise<T> {
  await secRateLimiter.acquire();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      headers: SEC_HEADERS,
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`SEC EDGAR HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export async function resolveCik(symbol: string): Promise<string | null> {
  const sym = symbol.toUpperCase();
  const profileCik = TICKER_UNIVERSE[sym]?.cik ?? CIK_FALLBACK[sym];
  if (profileCik) return profileCik;
  if (sym.includes("=") || sym.endsWith("USD")) return null;

  try {
    const { data: map } = await getCachedOrFetch<Record<string, string>>(
      "sec:ticker_cik_map",
      86400,
      async () => {
        const raw = await fetchSecJson<
          Record<string, { cik_str: number; ticker: string }>
        >("https://www.sec.gov/files/company_tickers.json");
        const out: Record<string, string> = {};
        for (const entry of Object.values(raw)) {
          out[entry.ticker.toUpperCase()] = String(entry.cik_str).padStart(
            10,
            "0"
          );
        }
        return out;
      },
      () => CIK_FALLBACK
    );
    return map[sym] ?? null;
  } catch {
    return null;
  }
}

export async function getFinancialStatements(symbol: string): Promise<{
  annual: FinancialPeriodRow[];
  quarterly: FinancialPeriodRow[];
  source: "live" | "cache" | "seed";
  cik: string | null;
}> {
  const sym = symbol.toUpperCase();
  const cik = await resolveCik(sym);
  if (!cik) {
    const seed = getSeedFinancials(sym);
    return { ...seed, source: "seed", cik: null };
  }

  const { data, source } = await getCachedOrFetch<{
    annual: FinancialPeriodRow[];
    quarterly: FinancialPeriodRow[];
  }>(
    `sec:facts:v2:${sym}`,
    86400, // 24 hours TTL
    async () => {
      const factsJson = await fetchSecJson<Parameters<typeof normalizeSecCompanyFacts>[0]>(
        `https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`
      );
      const normalized = normalizeSecCompanyFacts(factsJson);
      if (normalized.annual.length < 2) {
        throw new Error("Insufficient SEC XBRL annual periods");
      }
      return normalized;
    },
    () => getSeedFinancials(sym)
  );

  return { ...data, source, cik };
}

export async function getSecFilings(symbol: string): Promise<{
  filings: SecFilingItem[];
  source: "live" | "cache" | "seed";
}> {
  const sym = symbol.toUpperCase();
  const cik = await resolveCik(sym);
  if (!cik) {
    return { filings: getSeedSecFilings(sym), source: "seed" };
  }

  const { data, source } = await getCachedOrFetch<SecFilingItem[]>(
    `sec:filings:${sym}`,
    86400, // 24 hours TTL
    async () => {
      interface SubmissionsJson {
        filings?: {
          recent?: {
            accessionNumber: string[];
            form: string[];
            filingDate: string[];
            reportDate: string[];
            primaryDocDescription: string[];
            primaryDocument: string[];
          };
        };
      }
      const sub = await fetchSecJson<SubmissionsJson>(
        `https://data.sec.gov/submissions/CIK${cik}.json`
      );
      const recent = sub?.filings?.recent;
      if (!recent || !recent.form?.length) {
        throw new Error("No SEC recent filings");
      }

      const items: SecFilingItem[] = [];
      const cikNoZeros = String(Number(cik));
      for (let i = 0; i < recent.form.length && items.length < 12; i++) {
        const form = recent.form[i];
        if (!["10-K", "10-Q", "8-K", "4"].includes(form)) continue;
        const acc = recent.accessionNumber[i];
        const accClean = acc.replace(/-/g, "");
        const doc = recent.primaryDocument[i] || "";
        items.push({
          accessionNumber: acc,
          form,
          filingDate: recent.filingDate[i],
          reportDate: recent.reportDate[i] || recent.filingDate[i],
          description:
            recent.primaryDocDescription[i] || `${sym} Form ${form} Filing`,
          url: `https://www.sec.gov/Archives/edgar/data/${cikNoZeros}/${accClean}/${doc}`,
        });
      }
      if (items.length === 0) throw new Error("No matching forms");
      return items;
    },
    () => getSeedSecFilings(sym)
  );

  return { filings: data, source };
}
