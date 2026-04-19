"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type LangContextValue = {
  lang: string;
  setLang: Dispatch<SetStateAction<string>>;
};

const LangContext = createContext<LangContextValue>({
  lang: "Hinglish",
  setLang: () => undefined,
});

type LangProviderProps = {
  children: ReactNode;
};

export function LangProvider({ children }: LangProviderProps) {
  const [lang, setLang] = useState("Hinglish");

  useEffect(() => {
    const savedLang = window.localStorage.getItem("saathi_lang");
    if (savedLang) {
      setLang(savedLang);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("saathi_lang", lang);
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
