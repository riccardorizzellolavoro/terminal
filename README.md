# OpenTerminal

100% local-first, portable institutional financial research application with zero accounts, zero logins, and zero subscriptions.

## Features

- **Every Major Asset Class:**
  - **Equities:** US & European stocks (`AAPL`, `NVDA`, `MSFT`, `TSLA`, `ENI.MI`, `RACE.MI`, `UCG.MI`, `SAP.DE`, `ASML.AS`, and more)
  - **ETFs & Funds:** `SPY`, `QQQ`, `IWDA.AS`, `VWCE.DE`, `TLT`, `HYG`, `LQD`, `GLD`, `VNQ`, `SHY`, `IEF`
  - **Global Indices:** `^GSPC`, `^NDX`, `^DJI`, `FTSEMIB.MI`, `^STOXX50E`, `^GDAXI`, `^N225`, `^VIX`
  - **Forex:** `EURUSD=X`, `USDJPY=X`, `GBPUSD=X`, `USDCHF=X`, `EURCHF=X`, `EURGBP=X`, `DX-Y.NYB`
  - **Crypto:** `BTC-USD`, `ETH-USD`, `SOL-USD`, `XRP-USD`, `ADA-USD`, `BNB-USD` with live Binance WebSocket ticks
  - **Commodities & Futures:** `GC=F`, `SI=F`, `CL=F`, `BZ=F`, `NG=F`, `HG=F`, `ZC=F`, `ZW=F` with CFTC COT positioning
  - **Bonds & Sovereign Rates:** US Treasury curve (`US2Y`, `US5Y`, `US10Y`, `US30Y`), European benchmarks (`BTP10Y`, `BUND10Y`, `BTPBUND`, `ECBRATE`, `FEDFUNDS`)
  - **Options & Greeks:** Side-by-side Calls/Puts chain (`±5` strikes default) with Black-Scholes `Delta`, `Gamma`, `Theta`, `Vega`
- **Inline `(?)` Beginner Help System:** Plain-English and plain-Italian 3-line explanations beside every financial, statistical, and trading term.
- **Full `EN | IT` Language Switcher:** Instant switching persisted in SQLite (`./data/cache.db`) and `localStorage`, including bilingual glossary tooltips and Italian AI Analyst responses.
- **Zero-Subscription Data Layer:** `yahoo-finance2`, SEC EDGAR (`OpenTerminal/1.0`), FRED public CSVs, Binance WebSocket, and deterministic local seed fallback.

## Portable Quick Start

```bash
npm install
npm run portable
```

Or run in development mode:

```bash
npm run dev
```
