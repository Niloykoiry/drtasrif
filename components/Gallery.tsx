"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, GalleryHorizontalEnd } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fadeUp, stagger } from "@/lib/motion";
import Modal from "./Modal";

const IMAGES = [
  "/images/hospital-visit-workshop.jpg",
  "/images/gallery-workshop.png",
  "/images/gallery-scholarship.png",
  "/images/gallery-conference.png",
];

export default function Gallery() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? t.gallery.items[selected] : null;

  return (
    <section
      id="gallery"
      className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-100/60 py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-gradient-to-br from-sky-200/50 to-teal-200/40 blur-3xl"
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="container-x"
      >
        <motion.div variants={fadeUp} className="mx-auto max-w-2xl text-center">
          <span className="section-label">
            <GalleryHorizontalEnd className="h-3.5 w-3.5" />
            {t.gallery.label}
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">
            {t.gallery.heading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {t.gallery.sub}
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {t.gallery.items.map((item, i) => (
            <motion.button
              key={item.title}
              type="button"
              variants={fadeUp}
              onClick={() => setSelected(i)}
              className="group overflow-hidden rounded-3xl border border-white/70 bg-white/70 text-left shadow-soft backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:shadow-glass"
            >
              <div className="relative overflow-hidden">
                <Image
                  src={IMAGES[i]}
                  alt=""
                  width={1024}
                  height={768}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-navy/40 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
              </div>
              <div className="p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600">
                  {item.meta}
                </p>
                <h3 className="mt-1.5 text-sm font-bold text-navy">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  {item.desc}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-700 transition group-hover:text-teal-600">
                  {t.gallery.viewDetails}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={active?.title ?? ""}
        wide
      >
        {active && selected !== null && (
          <div>
            <Image
              src={IMAGES[selected]}
              alt=""
              width={1024}
              height={768}
              className="aspect-[4/3] w-full rounded-2xl object-cover"
            />
            <p className="mt-5 text-[10px] font-bold uppercase tracking-widest text-teal-600">
              {active.meta}
            </p>
            <h3 className="mt-1.5 text-xl font-extrabold text-navy">
              {active.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {active.full}
            </p>
            <p className="mt-4 text-[11px] italic text-slate-400">
              {t.gallery.placeholderNote}
            </p>
          </div>
        )}
      </Modal>
    </section>
  );
}
