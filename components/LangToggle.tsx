"use client";

import { useI18n } from "@/lib/i18n";

export default function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  const base = "rounded-full px-2 py-0.5 transition";
  const activeCls = "bg-white text-blue-700 shadow-sm";
  const idleCls = "text-slate-400 hover:text-slate-600";

  return (
    <div className={`flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1.5 text-[11px] font-bold ${className}`}>
      <button type="button" onClick={() => setLang("en")} aria-pressed={lang === "en"} className={`${base} ${lang === "en" ? activeCls : idleCls}`}>
        EN
      </button>
      <span className="text-slate-300" aria-hidden="true">
        /
      </span>
      <button type="button" onClick={() => setLang("bn")} aria-pressed={lang === "bn"} className={`${base} ${lang === "bn" ? activeCls : idleCls}`}>
        বাংলা
      </button>
    </div>
  );
}
