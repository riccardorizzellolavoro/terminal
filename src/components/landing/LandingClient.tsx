"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  Download,
  HelpCircle,
  Play,
  Sparkles,
  TrendingUp,
  X,
} from "lucide-react";

type ModalKind = null | "webinar" | "keynote" | "trial" | "signin" | "support";

function buildKeynoteIcs(): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//OpenForecaster//Keynote//EN",
    "BEGIN:VEVENT",
    "UID:openforecaster-keynote-20261216@openforecaster.dev",
    "DTSTAMP:20261126T220000Z",
    "DTSTART:20261216T100000Z",
    "DTEND:20261216T113000Z",
    "SUMMARY:OpenForecaster Keynote LIVE EVENT — A NEW WORLD",
    "DESCRIPTION:Institutional local-first quant terminal keynote & live demonstration.",
    "LOCATION:Online Livestream (OpenForecaster)",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function downloadIcsFile() {
  const blob = new Blob([buildKeynoteIcs()], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "OpenForecaster-Keynote-Dec16-2026.ics";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function OrbitLogo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="16"
        r="12"
        stroke="rgba(255,255,255,0.16)"
        strokeWidth="1.4"
      />
      <ellipse
        cx="16"
        cy="16"
        rx="13.5"
        ry="5.5"
        transform="rotate(-28 16 16)"
        stroke="#3B82F6"
        strokeWidth="1.6"
      />
      <circle cx="16" cy="16" r="3.4" fill="#F8FAFC" />
      <circle cx="26.2" cy="10.4" r="1.8" fill="#10B981" />
    </svg>
  );
}

export function LandingClient() {
  const router = useRouter();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

  // Interactive preview card state
  const [selectedValTicker, setSelectedValTicker] = useState<"AAPL" | "NVDA" | "MSFT">("AAPL");
  const [selectedSeasSpan, setSelectedSeasSpan] = useState<"10Y" | "20Y" | "30Y">("30Y");
  const [selectedAiChip, setSelectedAiChip] = useState<0 | 1 | 2>(0);

  // Modal form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const openModal = (kind: ModalKind) => {
    setSubmittedMsg(null);
    setFormError(null);
    setActiveModal(kind);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const type =
        activeModal === "webinar"
          ? "webinar"
          : activeModal === "keynote"
            ? "keynote"
            : activeModal === "signin"
              ? "signin"
              : "trial";
      const res = await fetch("/api/funnel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          email,
          name,
          plan: billingCycle,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setFormError(json.error || "Please enter a valid email address.");
        return;
      }

      if (activeModal === "trial" || activeModal === "signin") {
        router.push("/terminal/AAPL");
        return;
      }

      setSubmittedMsg(
        activeModal === "keynote"
          ? "Seat confirmed for December 16, 2026 (11:00 CET). Download your calendar invite below."
          : "Spot reserved for the Dec 2, 2026 Market Webinar. Calendar details saved locally."
      );
    } catch {
      setFormError("Unable to submit right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const previewValuations = {
    AAPL: { price: "$234.82", fair: "$268.40", delta: "+14.3%", fScore: "8/9" },
    NVDA: { price: "$141.65", fair: "$174.90", delta: "+23.5%", fScore: "8/9" },
    MSFT: { price: "$428.40", fair: "$479.10", delta: "+11.8%", fScore: "9/9" },
  }[selectedValTicker];

  const previewSeasonality = {
    "10Y": { winRate: "80.0%", avg: "+4.82%", path: "M 0 66 C 35 60, 70 46, 110 40 C 155 32, 195 18, 240 12" },
    "20Y": { winRate: "75.0%", avg: "+4.15%", path: "M 0 68 C 40 58, 75 50, 115 44 C 160 36, 200 24, 240 18" },
    "30Y": { winRate: "76.7%", avg: "+4.46%", path: "M 0 67 C 38 62, 80 48, 120 42 C 165 34, 202 22, 240 15" },
  }[selectedSeasSpan];

  const previewAiResponses = [
    {
      chip: "Scan latest earnings call for red flags",
      quote: "Greater China revenue declined 2.8% YoY to $14.3B on local flagship competition.",
      badge: "[Transcript Q3 '26, ¶22]",
    },
    {
      chip: "Compare Q3 vs Q4 management tone",
      quote: "Management shifted from cautious Q3 supply commentary to 6%–8% Q4 revenue guidance.",
      badge: "[Transcript Q4 '26, ¶08]",
    },
    {
      chip: "Summarize guidance & capex changes",
      quote: "CapEx rose 18% sequentially to $3.1B for Private Cloud Compute; FY FCF reached $113.8B.",
      badge: "[Transcript Q4 '26, ¶19]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      {/* 1. Single Slim Top Announcement Bar (h-10) */}
      {bannerVisible && (
        <div className="relative z-40 flex h-10 items-center justify-center border-b border-white/[0.08] bg-[#0F131C] px-10 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => openModal("webinar")}
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
            <span>
              Free Weekly Market Webinar — Dec 2, 2026 ·{" "}
              <span className="font-medium text-[#3B82F6]">Reserve a spot →</span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setBannerVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Minimal Sticky Navbar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#07090E]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <OrbitLogo className="h-7 w-7" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-white">
                OpenForecaster
              </div>
              <div className="text-[11px] text-slate-400">
                Local-First Quant &amp; Terminal
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
            <a href="#tutorials" className="transition hover:text-white">
              Tutorials
            </a>
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => openModal("signin")}
              className="text-sm text-slate-300 transition hover:text-white"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => openModal("trial")}
              className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563EB]"
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>
      </header>

      {/* 3. Focused Hero Section (#07090E Deep Space Theme) */}
      <section className="relative overflow-hidden border-b border-white/[0.08] bg-[#07090E]">
        <div className="relative mx-auto min-h-[580px] max-w-7xl px-6 py-20 lg:flex lg:items-center lg:justify-end lg:py-28">
          {/* Left-anchored astronaut backdrop */}
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/images/astronaut-hero.jpg"
              alt="Astronaut looking upward with geometric Earth reflection"
              className="h-full w-full object-cover object-left opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/15 via-[#07090E]/55 to-[#07090E]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/30" />
          </div>

          {/* Right-aligned bold white headline & CTAs */}
          <div className="relative z-10 max-w-xl text-left lg:text-right">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-[#12161F]/80 px-3.5 py-1 text-xs text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
              Local-First Institutional Research
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              A NEW WORLD
            </h1>

            <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
              Forecaster Keynote LIVE EVENT — Wednesday, December 16, 2026, 11:00
              CET (UTC+1)
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 lg:justify-end">
              <button
                type="button"
                onClick={() => openModal("keynote")}
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-[#3B82F6]/20 transition hover:bg-[#2563EB]"
              >
                <Calendar className="h-4 w-4" />
                Register for the Keynote
              </button>
              <Link
                href="/terminal/AAPL"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.12] bg-[#12161F]/80 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:text-white"
              >
                Launch Terminal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Below-the-Fold 3 Interactive Preview Cards */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Institutional clarity without the clutter
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Zero API keys required. Live SEC EDGAR, FRED yields, Yahoo Finance
            chains, and deterministic quant models cached locally in SQLite.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card 1: Fair Value in Seconds */}
          <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  1. Fair Value in Seconds
                </span>
                <div className="flex gap-1">
                  {(["AAPL", "NVDA", "MSFT"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSelectedValTicker(t)}
                      className={`rounded px-2 py-0.5 font-mono text-[11px] transition ${
                        selectedValTicker === t
                          ? "bg-[#3B82F6] text-white"
                          : "bg-white/[0.04] text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-baseline justify-between">
                <div>
                  <div className="font-mono text-2xl font-semibold tabular-nums text-white">
                    {previewValuations.fair}
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Composite Target vs{" "}
                    <span className="font-mono tabular-nums text-slate-200">
                      {previewValuations.price}
                    </span>
                  </div>
                </div>
                <span className="rounded-md bg-[#10B981]/15 px-2.5 py-1 font-mono text-xs font-medium tabular-nums text-[#10B981]">
                  {previewValuations.delta} Upside
                </span>
              </div>

              <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#3B82F6] to-[#10B981]" />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-400">
                <span>DCF · EVA · Lynch</span>
                <span className="font-mono tabular-nums text-slate-300">
                  Piotroski {previewValuations.fScore}
                </span>
              </div>
            </div>

            <p className="mt-6 border-t border-white/[0.06] pt-4 text-sm text-slate-400">
              Blend DCF, EVA, and Peter Lynch formulas with SEC XBRL Q4
              normalization in one click.
            </p>
          </div>

          {/* Card 2: 30-Year Seasonality */}
          <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  2. 30-Year Seasonality
                </span>
                <div className="flex gap-1">
                  {(["10Y", "20Y", "30Y"] as const).map((span) => (
                    <button
                      key={span}
                      type="button"
                      onClick={() => setSelectedSeasSpan(span)}
                      className={`rounded px-2 py-0.5 font-mono text-[11px] transition ${
                        selectedSeasSpan === span
                          ? "bg-[#3B82F6] text-white"
                          : "bg-white/[0.04] text-slate-400 hover:text-white"
                      }`}
                    >
                      {span}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-baseline justify-between">
                <div className="font-mono text-2xl font-semibold tabular-nums text-white">
                  {previewSeasonality.winRate} Win Rate
                </div>
                <span className="font-mono text-xs font-medium tabular-nums text-[#10B981]">
                  {previewSeasonality.avg} Avg
                </span>
              </div>

              <svg
                viewBox="0 0 240 80"
                className="mt-4 h-16 w-full"
                aria-hidden="true"
              >
                <line
                  x1="0"
                  y1="66"
                  x2="240"
                  y2="66"
                  stroke="rgba(255,255,255,0.08)"
                  strokeDasharray="3 3"
                />
                <path
                  d={previewSeasonality.path}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <p className="mt-6 border-t border-white/[0.06] pt-4 text-sm text-slate-400">
              Drag-select any calendar window across 10, 20, or 30 detrended
              years of daily market history.
            </p>
          </div>

          {/* Card 3: Citation-Backed AI Analyst */}
          <div className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  3. Citation-Backed AI Analyst
                </span>
                <Sparkles className="h-4 w-4 text-[#3B82F6]" />
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {previewAiResponses.map((item, idx) => (
                  <button
                    key={item.chip}
                    type="button"
                    onClick={() => setSelectedAiChip(idx as 0 | 1 | 2)}
                    className={`rounded-md px-2.5 py-1 text-left text-[11px] transition ${
                      selectedAiChip === idx
                        ? "bg-[#3B82F6]/20 text-[#93C5FD]"
                        : "bg-white/[0.04] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {item.chip}
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-lg bg-[#0B0E14] p-3.5 text-xs leading-relaxed text-slate-300">
                {previewAiResponses[selectedAiChip].quote}{" "}
                <span className="ml-1 inline-block rounded bg-[#3B82F6]/15 px-1.5 py-0.5 font-mono text-[10px] text-[#60A5FA]">
                  {previewAiResponses[selectedAiChip].badge}
                </span>
              </div>
            </div>

            <p className="mt-6 border-t border-white/[0.06] pt-4 text-sm text-slate-400">
              Every number links directly to an indexed 10-K or transcript
              paragraph—zero fabricated figures.
            </p>
          </div>
        </div>
      </section>

      {/* Tutorials Strip */}
      <section
        id="tutorials"
        className="border-y border-white/[0.08] bg-[#07090E]/60 py-14"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-[#3B82F6]">
              Walkthroughs &amp; Workflows
            </div>
            <h3 className="mt-1 text-xl font-semibold text-white">
              Master the command bar in 90 seconds
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Jump across quotes, financials, seasonality, and options using
              mnemonics like{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-200">
                NVDA FA
              </code>
              ,{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-200">
                TSLA OMON
              </code>
              , or{" "}
              <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs text-slate-200">
                AAPL VAL
              </code>
              .
            </p>
          </div>
          <Link
            href="/terminal/AAPL"
            className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] bg-[#12161F] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/25"
          >
            <Play className="h-4 w-4 text-[#10B981]" />
            Open Live Workspace
          </Link>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Transparent pricing. 7-day free trial.
            </h2>
            <p className="mt-1.5 text-sm text-slate-400">
              No credit card required to explore local SQLite caching, live
              market pills, and deterministic quant models.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#12161F] p-1 text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`rounded-md px-3 py-1.5 transition ${
                billingCycle === "monthly"
                  ? "bg-white/[0.1] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("annual")}
              className={`rounded-md px-3 py-1.5 transition ${
                billingCycle === "annual"
                  ? "bg-[#3B82F6] text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Annual · Save 25%
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Monthly / Core Plan */}
          <div className="rounded-xl border border-white/[0.08] bg-[#12161F] p-6">
            <div className="text-sm font-medium text-slate-300">
              Research Core
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold tabular-nums text-white">
                {billingCycle === "annual" ? "$29" : "$39"}
              </span>
              <span className="text-sm text-slate-400">/ month</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Full local-first terminal, SEC XBRL normalization, and 30-year
              seasonality engine.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" />
                Real-time Binance ticks, FRED macro, Yahoo options chains
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" />
                Composite DCF, EVA, Peter Lynch, Piotroski &amp; Altman scores
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" />
                Multi-asset Screener &amp; SQLite sub-100ms local cache
              </li>
            </ul>
            <button
              type="button"
              onClick={() => openModal("trial")}
              className="mt-8 w-full rounded-lg border border-white/[0.12] bg-white/[0.04] py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08]"
            >
              Start 7-Day Free Trial
            </button>
          </div>

          {/* Institutional Pro Plan */}
          <div className="rounded-xl border border-[#3B82F6]/40 bg-[#12161F] p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                Institutional Quant Pro
              </span>
              <span className="rounded-full bg-[#3B82F6]/15 px-2.5 py-0.5 text-xs font-medium text-[#60A5FA]">
                Most Popular
              </span>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-semibold tabular-nums text-white">
                {billingCycle === "annual" ? "$59" : "$79"}
              </span>
              <span className="text-sm text-slate-400">/ month</span>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              Adds smart-money COT &amp; Form 4 alerts, 1x2 split-screen
              workspace, and BYOK/Ollama AI Analyst.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" />
                Everything in Research Core + 1x2 linked split workspace
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" />
                CFTC COT extreme alerts, Form 4 &amp; US Congress feeds
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" />
                Citation-locked AI Analyst (Local RAG, Ollama, OpenAI, Claude)
              </li>
            </ul>
            <button
              type="button"
              onClick={() => openModal("trial")}
              className="mt-8 w-full rounded-lg bg-[#3B82F6] py-2.5 text-sm font-medium text-white transition hover:bg-[#2563EB]"
            >
              Start 7-Day Free Trial
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-slate-500">
        OpenForecaster · Local-First Institutional Financial Research Terminal ·
        Data powered by SEC EDGAR, FRED, Yahoo Finance &amp; Binance
      </footer>

      {/* Minimal bottom-right support trigger */}
      <button
        type="button"
        onClick={() => openModal("support")}
        aria-label="Open support"
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-[#12161F] px-3.5 py-2 text-xs text-slate-300 shadow-lg transition hover:border-white/25 hover:text-white"
      >
        <HelpCircle className="h-3.5 w-3.5 text-[#3B82F6]" />
        Support
      </button>

      {/* Modals (Closed by default) */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-white/[0.1] bg-[#12161F] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {activeModal === "webinar" && "Reserve Spot — Dec 2, 2026 Webinar"}
                {activeModal === "keynote" && "Register — Forecaster Keynote"}
                {activeModal === "trial" && "Start Your 7-Day Free Trial"}
                {activeModal === "signin" && "Sign In to OpenForecaster"}
                {activeModal === "support" && "OpenForecaster Support"}
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setActiveModal(null)}
                className="rounded p-1 text-slate-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeModal === "support" ? (
              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <p>
                  OpenForecaster runs locally with SQLite caching at{" "}
                  <code className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-xs">
                    ./data/cache.db
                  </code>
                  .
                </p>
                <p className="text-slate-400">
                  Press <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs">/</kbd> or{" "}
                  <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs">Cmd+K</kbd> inside the
                  terminal for fuzzy ticker &amp; function navigation, or{" "}
                  <kbd className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs">Cmd+J</kbd> for the
                  citation-locked AI Analyst.
                </p>
                <Link
                  href="/terminal/AAPL"
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] hover:underline"
                >
                  Open Terminal <TrendingUp className="h-4 w-4" />
                </Link>
              </div>
            ) : submittedMsg ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-lg bg-[#10B981]/10 p-3.5 text-sm text-[#10B981]">
                  {submittedMsg}
                </div>
                {activeModal === "keynote" && (
                  <button
                    type="button"
                    onClick={downloadIcsFile}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#3B82F6] py-2.5 text-sm font-medium text-white transition hover:bg-[#2563EB]"
                  >
                    <Download className="h-4 w-4" />
                    Download Calendar Invite (.ics)
                  </button>
                )}
                <Link
                  href="/terminal/AAPL"
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.12] py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.04]"
                >
                  Continue to Terminal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-400">
                  {activeModal === "keynote" &&
                    "Wednesday, December 16, 2026 · 11:00 CET (UTC+1). Instant .ics calendar invite included."}
                  {activeModal === "webinar" &&
                    "Free Weekly Market Webinar — Dec 2, 2026. Seasonality & Smart Money setup review."}
                  {activeModal === "trial" &&
                    "No credit card required. Launches straight into your local-first terminal."}
                  {activeModal === "signin" &&
                    "Enter your email to restore your local watchlist and trial session."}
                </p>

                {(activeModal === "keynote" || activeModal === "webinar") && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full rounded-lg border border-white/[0.1] bg-[#0B0E14] px-3 py-2 text-sm text-white outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Work or Personal Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@firm.com"
                    className="w-full rounded-lg border border-white/[0.1] bg-[#0B0E14] px-3 py-2 text-sm text-white outline-none focus:border-[#3B82F6]"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-[#F43F5E]">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#3B82F6] py-2.5 text-sm font-medium text-white transition hover:bg-[#2563EB] disabled:opacity-60"
                >
                  {submitting
                    ? "Submitting..."
                    : activeModal === "keynote"
                      ? "Confirm Keynote Registration"
                      : activeModal === "webinar"
                        ? "Reserve Webinar Spot"
                        : activeModal === "signin"
                          ? "Continue to Terminal"
                          : "Start 7-Day Free Trial"}
                </button>

                {(activeModal === "trial" || activeModal === "signin") && (
                  <Link
                    href="/terminal/AAPL"
                    className="block text-center text-xs text-slate-400 transition hover:text-white"
                  >
                    Skip &amp; open /terminal/AAPL directly →
                  </Link>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
