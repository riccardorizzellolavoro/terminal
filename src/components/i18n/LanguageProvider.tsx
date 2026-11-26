"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { enDict, TranslationDict } from "@/i18n/en";
import { itDict } from "@/i18n/it";
import { LangCode } from "@/lib/types";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (next: LangCode) => void;
  t: TranslationDict;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => {},
  t: enDict,
});

const STORAGE_KEY = "openterminal_lang";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === "it" || saved === "en") {
        setLangState(saved);
        return;
      }
    } catch {
      // ignore storage errors
    }

    fetch("/api/preferences")
      .then((r) => r.json())
      .then((json: { preferences?: Record<string, string> }) => {
        const dbLang = json.preferences?.lang;
        if (dbLang === "it" || dbLang === "en") {
          setLangState(dbLang);
          try {
            window.localStorage.setItem(STORAGE_KEY, dbLang);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {});
  }, []);

  const setLang = (next: LangCode) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "lang", value: next }),
    }).catch(() => {});
  };

  const t = lang === "it" ? itDict : enDict;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
