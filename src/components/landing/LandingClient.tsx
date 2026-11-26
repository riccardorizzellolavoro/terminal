"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Calendar,
  Check,
  Download,
  X,
} from "lucide-react";

type ModalKind = null | "webinar" | "keynote" | "signin";

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
    </svg>
  );
}

export function LandingClient() {
  const router = useRouter();
  const [bannerVisible, setBannerVisible] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalKind>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");

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
            : "signin";
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

      if (activeModal === "signin") {
        router.push("/terminal/AAPL");
        return;
      }

      setSubmittedMsg(
        activeModal === "keynote"
          ? "Seat confirmed for December 16, 2026 (11:00 CET). Download your calendar invite below."
          : "Spot reserved for the Dec 2, 2026 Market Webinar."
      );
    } catch {
      setFormError("Unable to submit right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100">
      {/* 1. Slim Dismissible Top Bar */}
      {bannerVisible && (
        <div className="relative z-40 flex h-10 items-center justify-center border-b border-white/[0.06] bg-[#11151E] px-10 text-xs text-slate-300">
          <button
            type="button"
            onClick={() => openModal("webinar")}
            className="inline-flex items-center gap-2 transition hover:text-white"
          >
            <span>
              Free Weekly Market Webinar — Dec 2, 2026 ·{" "}
              <span className="font-medium text-white underline underline-offset-4">
                Reserve a spot →
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setBannerVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Minimal Navbar: 4 items (Logo, Features, Pricing, Open Terminal CTA + subtle Sign In) */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0E14]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <OrbitLogo className="h-6 w-6" />
            <span className="text-sm font-semibold tracking-tight text-white">
              OpenForecaster
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-400 md:flex">
            <a href="#features" className="transition hover:text-white">
              Features
            </a>
            <a href="#pricing" className="transition hover:text-white">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => openModal("signin")}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Sign In
            </button>
            <Link
              href="/terminal"
              className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2563EB]"
            >
              Open Terminal
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Deep Space Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#07090E]">
        <div className="relative mx-auto min-h-[560px] max-w-6xl px-6 py-24 lg:flex lg:items-center lg:justify-end lg:py-32">
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/images/astronaut-hero.jpg"
              alt="Astronaut looking upward with geometric Earth reflection"
              className="h-full w-full object-cover object-left opacity-85"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/15 via-[#07090E]/60 to-[#07090E]" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/30" />
          </div>

          <div className="relative z-10 max-w-lg text-left lg:text-right">
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
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#2563EB]"
              >
                <Calendar className="h-4 w-4" />
                Register for Keynote
              </button>
              <Link
                href="/terminal/AAPL"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#11151E] px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-white/25 hover:text-white"
              >
                Launch Terminal
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Below the Fold: 3 Spacious Alternating Feature Rows */}
      <section id="features" className="mx-auto max-w-6xl space-y-20 px-6 py-24">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Calm, verifiable financial research
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            Zero external API keys required. Live SEC EDGAR filings, FRED yields,
            and Yahoo options chains are normalized locally in SQLite.
          </p>
        </div>

        {/* Row 1: Composite Fair Value (Visual Left, Text Right) */}
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
            <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-4">
              <div>
                <div className="text-xs text-slate-400">
                  CRM · Composite Fair Value
                </div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  $334.47
                </div>
              </div>
              <span className="font-mono text-sm font-medium tabular-nums text-[#10B981]">
                +69.6% Upside
              </span>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Discounted Cash Flow (DCF)</span>
                <span className="font-mono tabular-nums text-white">$348.20</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Peter Lynch Fair Value</span>
                <span className="font-mono tabular-nums text-white">$321.10</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Piotroski F-Score</span>
                <span className="font-mono tabular-nums text-slate-200">7 / 9</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white">
              1. Deterministic Fair Value in Seconds
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Blend DCF, Economic Value Added, and Peter Lynch models against
              live SEC XBRL statements with automatic Q4 derivation. Toggle any
              model inside the workspace to stress-test intrinsic value without
              spreadsheet friction.
            </p>
          </div>
        </div>

        {/* Row 2: 30-Year Seasonality (Text Left, Visual Right) */}
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <h3 className="text-xl font-semibold text-white">
              2. 30-Year Detrended Seasonality &amp; Flows
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Inspect 10, 20, and 30-year annualized seasonal curves with linear
              drift removed across any custom calendar window. Pair seasonal win
              rates directly with SEC Form 4 insider buys, Congressional
              disclosures, and CFTC COT extremes.
            </p>
          </div>

          <div className="order-1 rounded-xl border border-white/[0.06] bg-[#11151E] p-6 md:order-2">
            <div className="flex items-baseline justify-between border-b border-white/[0.06] pb-4">
              <div>
                <div className="text-xs text-slate-400">
                  NVDA · Nov 26 – Dec 26 Window
                </div>
                <div className="mt-1 font-mono text-2xl font-semibold tabular-nums text-white">
                  80.0% Win Rate
                </div>
              </div>
              <span className="font-mono text-sm font-medium tabular-nums text-[#10B981]">
                +9.44% Avg
              </span>
            </div>
            <svg viewBox="0 0 320 90" className="mt-5 h-20 w-full" aria-hidden="true">
              <line
                x1="0"
                y1="72"
                x2="320"
                y2="72"
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 4"
              />
              <path
                d="M 0 72 C 50 64, 95 52, 150 44 C 205 34, 260 20, 320 12"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M 0 72 C 55 68, 100 58, 155 52 C 210 44, 265 32, 320 26"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Row 3: Citation-Locked AI Analyst (Visual Left, Text Right) */}
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
            <div className="border-b border-white/[0.06] pb-3 text-xs text-slate-400">
              AI Analyst · AAPL Filing Audit
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-200">
              Capital expenditures rose 18% sequentially to $3.1 billion in Q4 to
              expand Private Cloud Compute silicon capacity, while full-year
              Free Cash Flow reached $113.8 billion.{" "}
              <span className="inline-block rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-xs text-white">
                [Transcript Q4 &apos;26, ¶19]
              </span>
            </p>
            <div className="mt-4 border-t border-white/[0.06] pt-3 font-mono text-xs text-slate-400">
              Unindexed figures strictly return: &quot;Not disclosed in indexed filings.&quot;
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-white">
              3. Citation-Locked AI Analyst
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Run local RAG out of the box or connect Ollama, OpenAI, or Claude
              with your own key. Every figure links directly to an indexed 10-K
              or earnings transcript paragraph so nothing is ever fabricated.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison (Simple 2-Card Layout) */}
      <section
        id="pricing"
        className="border-t border-white/[0.06] bg-[#0B0E14] py-24"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Simple pricing. 7-Day Free Trial.
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Explore the full terminal locally with zero credit card required.
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-[#11151E] p-1 text-xs">
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
                    ? "bg-white/[0.1] text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Annual · Save 25%
              </button>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-[#11151E] p-6">
              <div className="text-sm font-medium text-slate-300">
                Research Core
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold tabular-nums text-white">
                  {billingCycle === "annual" ? "$29" : "$39"}
                </span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Live SEC EDGAR, FRED macro &amp; Yahoo Finance chains
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  DCF, EVA, Lynch, Piotroski &amp; 30Y Seasonality
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Local SQLite sub-100ms cache
                </li>
              </ul>
              <Link
                href="/terminal"
                className="mt-8 block w-full rounded-lg border border-white/[0.1] py-2.5 text-center text-sm font-medium text-white transition hover:bg-white/[0.04]"
              >
                Start 7-Day Free Trial
              </Link>
            </div>

            <div className="rounded-xl border border-white/[0.12] bg-[#11151E] p-6">
              <div className="text-sm font-medium text-white">
                Institutional Quant Pro
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-semibold tabular-nums text-white">
                  {billingCycle === "annual" ? "$59" : "$79"}
                </span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Everything in Research Core + Smart Money flows
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  CFTC COT positioning, Form 4 &amp; Congress trades
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="h-4 w-4 text-[#10B981]" />
                  Citation-locked AI Analyst (Local RAG, Ollama, BYOK)
                </li>
              </ul>
              <Link
                href="/terminal"
                className="mt-8 block w-full rounded-lg bg-[#3B82F6] py-2.5 text-center text-sm font-medium text-white transition hover:bg-[#2563EB]"
              >
                Start 7-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-slate-500">
        OpenForecaster · Local-First Institutional Financial Research
      </footer>

      {/* Modals (Closed by default) */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-white/[0.08] bg-[#11151E] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {activeModal === "webinar" && "Reserve Spot — Dec 2, 2026 Webinar"}
                {activeModal === "keynote" && "Register — Forecaster Keynote"}
                {activeModal === "signin" && "Sign In to OpenForecaster"}
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setActiveModal(null)}
                className="rounded p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submittedMsg ? (
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
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/[0.1] py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.04]"
                >
                  Open Terminal
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-400">
                  {activeModal === "keynote" &&
                    "Wednesday, December 16, 2026 · 11:00 CET (UTC+1). Instant .ics calendar invite included."}
                  {activeModal === "webinar" &&
                    "Free Weekly Market Webinar — Dec 2, 2026."}
                  {activeModal === "signin" &&
                    "Enter your email to restore your local terminal session."}
                </p>

                {activeModal !== "signin" && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="w-full rounded-lg border border-white/[0.08] bg-[#0B0E14] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
                    />
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="analyst@firm.com"
                    className="w-full rounded-lg border border-white/[0.08] bg-[#0B0E14] px-3 py-2 text-sm text-white outline-none focus:border-white/30"
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
                        : "Continue to Terminal"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
