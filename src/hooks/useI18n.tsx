import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { t as translate, isRtl, LangCode } from "@/lib/i18n";

interface I18nCtx {
  lang: string;
  setLang: (l: string) => void;
  t: (key: string) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<string>(() => {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
  }, [lang]);

  return (
    <Ctx.Provider value={{ lang, setLang: setLangState, t: (k) => translate(lang, k) }}>
      {children}
    </Ctx.Provider>
  );
};

export const useI18n = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useI18n must be used within I18nProvider");
  return c;
};
