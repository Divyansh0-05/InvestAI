"use client";

import { useLang } from "@/context/LangContext";

const languages = ["Hinglish", "Hindi", "Bhojpuri", "Punjabi"];

export default function LangSwitcher() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex max-w-[210px] flex-wrap items-center justify-end gap-1.5">
      {languages.map((language) => {
        const isActive = language === lang;

        return (
          <button
            key={language}
            type="button"
            onClick={() => setLang(language)}
            className={[
              "rounded-full border px-3 py-1 text-[11px] font-medium transition sm:text-xs",
              isActive
                ? "border-white bg-white text-green-700 shadow-sm"
                : "border-white/70 bg-transparent text-white hover:bg-white/10",
            ].join(" ")}
          >
            {language}
          </button>
        );
      })}
    </div>
  );
}
