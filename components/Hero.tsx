"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronDown,
  HeartPulse,
  MapPin,
  Play,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { blurUp, fadeUp, floatLoop, stagger } from "@/lib/motion";

export default function Hero() {
  const { t } = useI18n();

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-indigo-100/80 via-sky-50 to-teal-50 pb-20 pt-32 sm:pb-24 sm:pt-36"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-200/60 to-sky-200/60 blur-3xl"
      />
      <motion.div
        variants={floatLoop}
        animate="animate"
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-gradient-to-br from-teal-200/50 to-indigo-200/50 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/3 top-10 h-64 w-64 rounded-full bg-sky-200/40 blur-3xl"
      />
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -50, 0], y: [0, 24, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl"
      />

      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative z-10 text-center lg:text-left"
        >
          <motion.span
            variants={fadeUp}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold text-teal-700 shadow-sm"
          >
            <BadgeCheck className="h-4 w-4 text-teal-500" />
            {t.hero.badge}
          </motion.span>
          <motion.h1
            variants={blurUp}
            className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-navy sm:text-5xl xl:text-6xl"
          >
            {t.hero.title}
          </motion.h1>
          <motion.p
            variants={blurUp}
            className="mt-3 bg-gradient-to-r from-teal-500 via-sky-600 to-teal-500 bg-clip-text text-lg font-bold text-transparent sm:text-2xl"
          >
            {t.hero.role}
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base lg:mx-0"
          >
            {t.hero.intro}
          </motion.p>
          <motion.div
            variants={fadeUp}
            className="mt-5 flex justify-center lg:justify-start"
          >
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-slate-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              {t.hero.location}
            </span>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center justify-center gap-5 lg:justify-start"
          >
            <a href="#appointment" className="btn-gradient px-7 py-3.5 text-sm">
              <CalendarDays className="h-4 w-4" />
              {t.hero.book}
              <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              className="group flex items-center gap-3 text-sm font-semibold text-slate-600 transition hover:text-teal-600"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-white/80 text-teal-600 shadow-sm transition group-hover:scale-105 group-hover:border-teal-300">
                <Play className="h-4 w-4 fill-current" />
              </span>
              {t.hero.watch}
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative mx-auto h-[420px] w-full max-w-[540px] sm:h-[500px] lg:h-[560px]"
        >
          <motion.div
            aria-hidden="true"
            variants={floatLoop}
            initial="initial"
            animate="animate"
            className="absolute left-[40%] top-1/2 h-[104%] w-[92%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[46%_54%_57%_43%/52%_46%_54%_48%] shadow-glass"
          >
            <Image
              src="/images/doctor.jpg"
              alt={t.hero.title}
              width={1024}
              height={1280}
              priority
              className="h-full w-full object-cover object-top"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, -100, 0], rotate: [5, 7, 5] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-20 top-6 z-10 w-40 rounded-[1.8rem] border border-white/60 bg-gradient-to-br from-sky-300/60 via-blue-300/50 to-indigo-300/60 p-2.5 shadow-glass backdrop-blur-md sm:-right-14 sm:w-52 lg:-right-16 lg:w-60"
          >
            <Image
              src="/images/skull-3d.png"
              alt=""
              width={1024}
              height={1024}
              className="w-full rounded-[1.4rem] mix-blend-multiply"
            />
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="glass absolute -left-2 top-10 z-30 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[11px] font-bold text-navy shadow-glass sm:left-0"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-sky-500 text-white">
              <HeartPulse className="h-3.5 w-3.5" />
            </span>
            {t.hero.chips[0]}
          </motion.div>
          <motion.div
            variants={floatLoop}
            initial="initial"
            animate="animate"
            className="glass absolute -right-2 bottom-16 z-30 flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-[11px] font-bold text-navy shadow-glass sm:right-0"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-blue-500 text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            {t.hero.chips[1]}
          </motion.div>

          <div
            aria-hidden="true"
            className="absolute -bottom-3 right-2 z-10 -rotate-6 text-right font-script text-2xl leading-snug text-sky-500/80 sm:text-3xl"
          >
            {t.hero.scriptLine1}
            <br />
            {t.hero.scriptLine2}
          </div>

          <motion.span
            aria-hidden="true"
            animate={{ y: [0, -6, 0], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-6 top-16 z-10 h-4 w-4 rounded-full bg-white/90 shadow"
          />
          <motion.span
            aria-hidden="true"
            variants={floatLoop}
            initial="hidden"
            animate="show"
            className="absolute bottom-24 left-14 z-10 h-6 w-6 rounded-full bg-teal-300/70 shadow"
          />
        </motion.div>
      </div>

      <a
        href="#about"
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-teal-600 sm:flex"
      >
        {t.hero.scroll}
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </a>
    </section>
  );
}
