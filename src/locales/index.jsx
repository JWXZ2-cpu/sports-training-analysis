import { createContext, useContext, useState, useCallback } from "react";
import zh from "./zh.js";
import en from "./en.js";
import it from "./it.js";

const locales = { zh, en, it };
const langOrder = ["zh", "en", "it"];
const langLabels = { zh: "中", en: "EN", it: "IT" };

const LocaleContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // 从 localStorage 读取保存的语言
    return localStorage.getItem("app_lang") || "zh";
  });
  const t = locales[lang];

  const setLanguage = useCallback((newLang) => {
    setLang(newLang);
    localStorage.setItem("app_lang", newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const idx = langOrder.indexOf(prev);
      const next = langOrder[(idx + 1) % langOrder.length];
      localStorage.setItem("app_lang", next);
      return next;
    });
  }, []);

  return (
    <LocaleContext.Provider value={{ lang, setLang: setLanguage, toggleLang, t, langLabels }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useI18n = () => useContext(LocaleContext);
