"use client";

import { Facebook, Linkedin, Youtube } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import LangToggle from "./LangToggle";
import ToothLogo from "./ToothLogo";

const SOCIALS = [
  { label: "Facebook", icon: <Facebook className="h-4 w-4" /> },
  { label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
  { label: "LinkedIn", icon: <Linkedin className="h-4 w-4" /> },
];

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-slate-100 bg-slate-50/70">
      <div className="container-x py-10">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          <a href="#home" className="flex items-center gap-3">
            <ToothLogo className="h-10 w-10" />
            <span className="leading-tight">
              <span className="block text-sm font-extrabold text-navy">{t.brand.name}</span>
              <span className="block text-[10px] font-medium text-teal-600">{t.brand.role}</span>
            </span>
          </a>

          <nav className="flex flex-wrap justify-center gap-x-7 gap-y-2" aria-label="Footer">
            {t.nav.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="text-xs font-semibold text-slate-500 transition hover:text-teal-600">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <LangToggle />
            <div className="flex items-center gap-2">
              {SOCIALS.map((social) => (
                <button
                  key={social.label}
                  type="button"
                  aria-label={`${social.label} (placeholder)`}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm transition hover:bg-gradient-to-r hover:from-blue-500 hover:to-teal-400 hover:text-white"
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 pt-6 text-[11px] text-slate-400 sm:flex-row">
          <p>{t.footer.copyright}</p>
          <p className="flex items-center gap-2">
            {t.footer.tagline.map((line, i) => (
              <span key={line} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-300" />}
                {line}
              </span>
            ))}
          </p>
        </div>
      </div>
    </footer>
  );
}
