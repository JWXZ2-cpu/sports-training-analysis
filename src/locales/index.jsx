import { createContext, useContext, useState, useCallback } from "react";
import zh from "./zh.js";
import en from "./en.js";
import it from "./it.js";

const locales = { zh, en, it };
const langOrder = ["zh", "en", "it"];

const LocaleContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("zh");
  const t = locales[lang];

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const idx = langOrder.indexOf(prev);
      return langOrder[(idx + 1) % langOrder.length];
    });
  }, []);

  return (
    <LocaleContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useI18n = () => useContext(LocaleContext);
