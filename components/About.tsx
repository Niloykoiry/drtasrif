"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, BriefcaseMedical, Check, GraduationCap, Plus, ShieldPlus, UserRound } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fadeUp, stagger } from "@/lib/motion";
import Modal from "./Modal";

const ICONS = [<GraduationCap className="h-5 w-5" />, <BriefcaseMedical className="h-5 w-5" />, <ShieldPlus className="h-5 w-5" />];
const GRADIENTS = ["from-teal-400 to-sky-500", "from-sky-400 to-blue-500", "from-teal-400 to-emerald-400"];

export default function About() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <section id="about" className="relative bg-gradient-to-b from-white via-sky-50/60 to-white py-24">
      <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.05fr_1fr]">
        <motion.div variants={fadeUp}>
          <span className="section-label">
            <UserRound className="h-3.5 w-3.5" />
            {t.about.label}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{t.about.heading}</h2>
          <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-[15px]">{t.about.body}</p>
          <button type="button" onClick={() => setOpen(true)} className="btn-outline mt-8 text-[13px]">
            {t.about.learnMore}
            <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>

        <motion.div variants={fadeUp} className="glass divide-y divide-slate-100/80 rounded-3xl bg-white/70 shadow-soft">
          {t.about.cards.map((card, i) => (
            <div key={card.title} className="flex items-start gap-4 p-5">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${GRADIENTS[i]} text-white shadow-md`}>
                {ICONS[i]}
              </span>
              <div>
                <h3 className="text-sm font-bold text-navy">{card.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{card.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div aria-hidden="true" className="absolute -left-8 -top-8 h-40 w-40 rounded-[45%_55%_50%_50%/55%_45%_55%_45%] bg-gradient-to-br from-violet-200/70 to-teal-200/70 blur-sm" />
          <div className="relative overflow-hidden rounded-[2.2rem] shadow-glass">
            <Image src="/images/about-surgery.png" alt="" width={1024} height={1024} className="aspect-[4/3.6] w-full object-cover" />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-blue-900/35 via-transparent to-transparent" />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 font-script text-3xl leading-snug text-white/95">
              {t.about.overlay.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t.about.learnMore}
            className="absolute -bottom-4 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white text-teal-600 shadow-glass transition duration-300 hover:rotate-90 hover:text-blue-600"
          >
            <Plus className="h-5 w-5" />
          </button>
        </motion.div>
      </motion.div>

      <Modal open={open} onClose={() => setOpen(false)} title={t.about.modal.title}>
        <h3 className="pr-10 text-xl font-extrabold text-navy">{t.about.modal.title}</h3>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">{t.about.modal.p1}</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{t.about.modal.p2}</p>
        <ul className="mt-5 space-y-2">
          {t.about.modal.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm text-slate-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <Check className="h-3 w-3" />
              </span>
              {point}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[11px] italic text-slate-400">{t.about.modal.note}</p>
      </Modal>
    </section>
  );
}
