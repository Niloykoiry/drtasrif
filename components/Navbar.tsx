"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useActiveSection } from "@/lib/useActiveSection";
import LangToggle from "./LangToggle";
import ToothLogo from "./ToothLogo";

const IDS = ["home", "about", "specializations", "before-after", "gallery", "appointment", "contact"];

export default function Navbar() {
  const { t } = useI18n();
  const active = useActiveSection(IDS);
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-100/80 bg-white/85 backdrop-blur-xl">
      <div className="container-x flex h-20 items-center justify-between gap-4">
        <a href="#home" className="flex items-center gap-3">
          <ToothLogo />
          <span className="leading-tight">
            <span className="block text-sm font-extrabold text-navy sm:text-[15px]">{t.brand.name}</span>
            <span className="block text-[10px] font-medium text-slate-500 sm:text-[11px]">{t.brand.role}</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {t.nav.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={`relative text-[13px] font-semibold transition-colors hover:text-teal-600 ${
                active === item.id ? "text-navy" : "text-slate-500"
              }`}
            >
              {item.label}
              <span
                className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300 ${
                  active === item.id ? "w-full" : "w-0"
                }`}
              />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangToggle className="hidden sm:flex" />
          <a href="#appointment" className="btn-gradient hidden px-5 py-2.5 text-[13px] md:inline-flex">
            <CalendarCheck className="h-4 w-4" />
            {t.cta}
          </a>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-navy transition hover:bg-slate-200 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl lg:hidden"
            aria-label="Mobile"
          >
            <div className="container-x flex flex-col gap-1 py-4">
              {t.nav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active === item.id ? "bg-sky-50 text-teal-600" : "text-slate-600 hover:bg-sky-50 hover:text-teal-600"
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-3 flex items-center justify-between gap-3 px-3 pb-2">
                <LangToggle />
                <a href="#appointment" onClick={() => setOpen(false)} className="btn-gradient flex-1 px-5 py-3 text-sm">
                  <CalendarCheck className="h-4 w-4" />
                  {t.cta}
                </a>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
