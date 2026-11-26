"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { GLOSSARY } from "@/i18n/glossary";

interface TermHelpProps {
  termKey: string;
}

export function TermHelp({ termKey }: TermHelpProps) {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null
  );
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const popRef = useRef<HTMLDivElement | null>(null);
  const popId = useId();

  const entry = GLOSSARY[termKey];

  const updatePosition = () => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const popWidth = 300;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = rect.left + rect.width / 2 - popWidth / 2;
    left = Math.max(12, Math.min(left, vw - popWidth - 12));
    const showAbove = rect.bottom + 210 > vh && rect.top > 220;
    const top = showAbove ? rect.top - 8 : rect.bottom + 8;
    setCoords({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (
        btnRef.current?.contains(target) ||
        popRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
      setPinned(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setPinned(false);
      }
    };

    window.addEventListener("mousedown", onDocClick);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("mousedown", onDocClick);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  if (!entry) return null;

  const title = lang === "it" ? entry.titleIt : entry.titleEn;
  const copy = lang === "it" ? entry.it : entry.en;
  const showAbove =
    typeof window !== "undefined" &&
    btnRef.current &&
    btnRef.current.getBoundingClientRect().bottom + 210 > window.innerHeight &&
    btnRef.current.getBoundingClientRect().top > 220;

  return (
    <span className="relative inline-flex items-center">
      <button
        ref={btnRef}
        type="button"
        aria-label={`${title} help`}
        aria-expanded={open}
        aria-describedby={open ? popId : undefined}
        onClick={(e) => {
          e.stopPropagation();
          const next = !open || !pinned;
          setPinned(next);
          setOpen(next);
          if (next) updatePosition();
        }}
        onMouseEnter={() => {
          updatePosition();
          setOpen(true);
        }}
        onMouseLeave={() => {
          if (!pinned) setOpen(false);
        }}
        className="ml-1.5 inline-flex h-3.5 w-3.5 cursor-help items-center justify-center rounded-full border border-white/15 text-[10px] leading-none text-slate-400 align-middle transition hover:border-white/40 hover:text-white"
      >
        ?
      </button>

      {open && coords && (
        <div
          ref={popRef}
          id={popId}
          role="tooltip"
          style={{
            top: coords.top,
            left: coords.left,
            transform: showAbove ? "translateY(-100%)" : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => {
            if (!pinned) setOpen(false);
          }}
          className="fixed z-[80] w-[300px] max-w-xs rounded-lg border border-white/10 bg-[#161B26] p-3.5 text-left text-xs leading-relaxed text-slate-200 shadow-xl"
        >
          <div className="mb-2 font-semibold text-white">{title}</div>
          <div className="space-y-1.5">
            <div>
              <span className="font-medium text-slate-400">
                {t.termHelp.whatItIs}:{" "}
              </span>
              <span>{copy.what}</span>
            </div>
            <div>
              <span className="font-medium text-slate-400">
                {t.termHelp.howToRead}:{" "}
              </span>
              <span>{copy.read}</span>
            </div>
            <div>
              <span className="font-medium text-slate-400">
                {t.termHelp.whyItMatters}:{" "}
              </span>
              <span>{copy.why}</span>
            </div>
          </div>
        </div>
      )}
    </span>
  );
}
