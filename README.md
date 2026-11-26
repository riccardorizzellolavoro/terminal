# OpenForecaster

Local-first institutional financial research terminal and SaaS funnel built with Next.js (App Router), TypeScript, Tailwind CSS, TradingView `lightweight-charts`, Apache `echarts`, `yahoo-finance2`, and `better-sqlite3`.

## Features

- **Zero-Subscription Data Layer:**
  - **Equities & Options:** `yahoo-finance2` (30s cache TTL)
  - **Fundamentals & Filings:** Official SEC EDGAR API with compliant `User-Agent`, 8 req/sec token-bucket rate limiting, 24h caching, standalone Q4 derivation (`FY - (Q1 + Q2 + Q3)`), and `Free Cash Flow = OCF - CapEx`
  - **Macro & Treasury Yields:** Public FRED CSV endpoints (`DGS10`, `DGS2`, `FEDFUNDS`, `CPIAUCSL`, `UNRATE`, 1h cache TTL)
  - **Real-Time Crypto Ticks:** Client-side Binance WebSocket (`BTC`, `ETH`, `SOL`)
  - **Local Persistence & Seed Layer:** SQLite at `./data/cache.db` + deterministic 30-year OHLCV, COT, Form 4, Congressional trades, and indexed transcripts/10-K chunks
- **Landing Funnel (`/`):** Announcement bar webinar modal, `"A NEW WORLD"` Keynote hero with `.ics` calendar export, interactive feature previews, and Monthly/Annual pricing.
- **Terminal Workspace (`/terminal/[ticker]`):**
  - Command Bar (`/`, `Cmd+K`, `Esc`) supporting `[TICKER]` and `[TICKER] [FUNCTION]` mnemonics (e.g., `NVDA FA`, `TSLA OMON`, `AAPL VAL`, `MSFT SEAS`, `WEI`)
  - Tabs (`1–8`): `Overview (DES)`, `Chart (GP)`, `Financials (FA)`, `Valuation (VAL)`, `Seasonality (SEAS)`, `Options (OMON)`, `Smart Money (COT)`, `Macro & News (WEI)`
  - Optional `1×2` split-screen workspace with link groups (`Group A`, `Group B`, `None`)
  - Citation-locked AI Analyst drawer (`Cmd+J` / `Ctrl+I`) supporting local RAG, Ollama, OpenAI-compatible, and Anthropic BYOK
- **Multi-Asset Discovery Screener (`/terminal/screener`):** One-click preset pills and granular slide-over filters.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
