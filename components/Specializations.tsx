"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fadeUp } from "@/lib/motion";
import Modal from "./Modal";

const IMAGES = [
  "/images/spec-maxillofacial.png",
  "/images/spec-oral-cancer.png",
  "/images/spec-implants.png",
  "/images/spec-facial-recon.png",
  "/images/spec-other.png",
];

export default function Specializations() {
  const { t } = useI18n();
  const scroller = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? t.spec.cards[selected] : null;
  const activeDetail = selected !== null ? t.spec.details[selected] : null;

  const scroll = (dir: number) => scroller.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <section id="specializations" className="relative overflow-hidden bg-gradient-to-br from-sky-100/70 via-indigo-50/60 to-teal-100/60 py-24">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-gradient-to-br from-teal-200/50 to-sky-200/40 blur-3xl" />

      <div className="container-x flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="section-label">
            <Stethoscope className="h-3.5 w-3.5" />
            {t.spec.label}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{t.spec.heading}</h2>
        </div>
        <div className="flex items-center gap-6">
          <p className="max-w-xs text-xs leading-relaxed text-slate-500 sm:text-sm">{t.spec.sub}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => scroll(-1)}
              aria-label="Previous specializations"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              aria-label="Next specializations"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm transition hover:bg-blue-600 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div ref={scroller} className="container-x no-scrollbar mt-10 flex snap-x gap-5 overflow-x-auto pb-4">
        {t.spec.cards.map((card, i) => (
          <motion.article
            key={card.title}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ delay: i * 0.08 }}
            className="group flex w-[240px] shrink-0 flex-col rounded-3xl border border-white/70 bg-white/70 p-3 shadow-soft backdrop-blur-md transition duration-300 hover:-translate-y-2 hover:shadow-glass sm:w-[260px] xl:w-[calc((100%-5rem)/5)]"
          >
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100">
              <Image
                src={IMAGES[i]}
                alt=""
                width={1024}
                height={1024}
                className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
            <h3 className="mt-4 px-2 text-sm font-bold text-navy">{card.title}</h3>
            <p className="mt-2 px-2 text-xs leading-relaxed text-slate-500">{card.desc}</p>
            <button
              type="button"
              onClick={() => setSelected(i)}
              aria-label={`${t.spec.viewDetails}: ${card.title}`}
              className="mx-2 mb-1 mt-4 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition duration-300 group-hover:bg-gradient-to-r group-hover:from-blue-500 group-hover:to-teal-400 group-hover:text-white hover:scale-110"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.article>
        ))}
      </div>

      <Modal open={selected !== null} onClose={() => setSelected(null)} title={active?.title ?? ""}>
        {active && activeDetail && selected !== null && (
          <div>
            <Image src={IMAGES[selected]} alt="" width={1024} height={1024} className="aspect-[4/3] w-full rounded-2xl object-cover" />
            <h3 className="mt-5 text-xl font-extrabold text-navy">{active.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{activeDetail.overview}</p>
            <h4 className="mt-5 text-[11px] font-bold uppercase tracking-[0.18em] text-teal-600">{t.spec.covers}</h4>
            <ul className="mt-3 space-y-2">
              {activeDetail.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                    <Check className="h-3 w-3" />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[11px] italic text-slate-400">{t.spec.scopeNote}</p>
          </div>
        )}
      </Modal>
    </section>
  );
}
