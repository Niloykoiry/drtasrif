"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fadeUp, stagger } from "@/lib/motion";

function MapBackdrop() {
  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect width="400" height="300" fill="#edf3f5" />
      <ellipse cx="70" cy="60" rx="70" ry="45" fill="#ddefdd" />
      <ellipse cx="340" cy="240" rx="80" ry="50" fill="#ddefdd" />
      <path d="M250 0c20 60 60 90 150 100V0Z" fill="#dcebf3" />
      <path d="M0 210c80 10 140 40 190 90H0Z" fill="#dcebf3" />
      <g stroke="#ffffff" strokeWidth="10" fill="none">
        <path d="M0 120h400" />
        <path d="M140 0v300" />
        <path d="M0 40l400 120" />
      </g>
      <g stroke="#ffffff" strokeWidth="4" fill="none">
        <path d="M0 170h400" />
        <path d="M60 0v300" />
        <path d="M240 0v300" />
        <path d="M320 0v300" />
        <path d="M0 250h400" />
        <path d="M0 80l200 220" />
      </g>
      <g stroke="#e0e8ec" strokeWidth="1.5" fill="none">
        <path d="M0 145h400" />
        <path d="M100 0v300" />
        <path d="M190 0v300" />
        <path d="M280 0v300" />
        <path d="M0 200h400" />
      </g>
    </svg>
  );
}

export default function Contact() {
  const { t } = useI18n();

  const items = [
    { icon: <MapPin className="h-4 w-4" />, value: t.contact.address, note: t.contact.addressNote },
    { icon: <Phone className="h-4 w-4" />, value: t.appt.phoneValue, note: t.appt.placeholder },
    { icon: <Mail className="h-4 w-4" />, value: t.appt.emailValue, note: t.appt.placeholder },
  ];

  return (
    <section id="contact" className="bg-white py-24">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="container-x grid items-center gap-12 lg:grid-cols-2">
        <motion.div variants={fadeUp}>
          <span className="section-label">
            <MapPin className="h-3.5 w-3.5" />
            {t.contact.label}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{t.contact.heading}</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-600">{t.contact.body}</p>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {items.map((item) => (
              <div key={item.value} className="flex min-w-0 items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-blue-700">{item.icon}</span>
                <div className="min-w-0">
                  <p className="break-words text-[13px] font-bold text-navy">{item.value}</p>
                  <p className="mt-0.5 break-words text-[11px] text-slate-400">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="relative h-72 overflow-hidden rounded-3xl border border-slate-100 shadow-inner sm:h-80">
          <MapBackdrop />
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
            <svg viewBox="0 0 24 24" className="h-9 w-9 drop-shadow" aria-hidden="true">
              <path
                fill="#2563eb"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
              />
            </svg>
            <span className="mt-1 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 shadow">{t.contact.mapCity}</span>
          </div>
          <div className="absolute right-4 top-1/2 w-44 -translate-y-1/2 rounded-2xl bg-white/90 p-4 shadow-glass backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[11px] font-bold text-navy">{t.contact.cardTitle}</p>
                <p className="text-[10px] text-slate-400">{t.contact.cardSub}</p>
              </div>
            </div>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Dhaka,+Bangladesh"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-lg bg-sky-100 py-2 text-center text-[11px] font-bold text-blue-700 transition hover:bg-sky-200"
            >
              {t.contact.viewMap}
            </a>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
