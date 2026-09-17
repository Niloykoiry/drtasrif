"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, CheckCircle2, Clock, Mail, Phone, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { fadeUp, stagger } from "@/lib/motion";

function InfoRow({ icon, value, note }: { icon: ReactNode; value: string; note: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-100 text-blue-700">{icon}</span>
      <div className="min-w-0">
        <p className="break-words text-[13px] font-bold text-navy">{value}</p>
        <p className="mt-0.5 break-words text-[11px] text-slate-400">{note}</p>
      </div>
    </div>
  );
}

export default function Appointment() {
  const { t } = useI18n();
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    e.currentTarget.reset();
  };

  return (
    <section id="appointment" className="bg-white py-24">
      <div className="container-x">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-sky-100 via-indigo-50 to-teal-100 p-5 shadow-soft sm:rounded-[2.5rem] sm:p-10 lg:p-12"
        >
          <div aria-hidden="true" className="absolute -bottom-16 -left-12 h-56 w-56 rounded-[60%_40%_55%_45%/50%_60%_40%_50%] bg-gradient-to-br from-teal-300/50 to-emerald-200/40 blur-md" />
          <div aria-hidden="true" className="absolute -right-10 -top-14 h-44 w-44 rounded-[45%_55%_50%_50%/55%_45%_55%_45%] bg-gradient-to-br from-sky-200/60 to-violet-200/50 blur-md" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_1.15fr_0.95fr] lg:gap-10">
            <motion.div variants={fadeUp} className="min-w-0">
              <span className="section-label">
                <CalendarCheck className="h-3.5 w-3.5" />
                {t.appt.label}
              </span>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy sm:text-4xl">{t.appt.heading}</h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{t.appt.body}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-teal-500" />
                  {t.appt.quick}
                </span>
                <span aria-hidden="true" className="h-3 w-px bg-slate-300" />
                <span>{t.appt.privacy}</span>
              </div>
            </motion.div>

            <motion.form variants={fadeUp} onSubmit={onSubmit} className="glass min-w-0 space-y-4 rounded-3xl bg-white/80 p-4 shadow-glass sm:p-6">
              <div>
                <label htmlFor="appt-name" className="sr-only">
                  {t.appt.name}
                </label>
                <input id="appt-name" name="name" required autoComplete="name" className="input-field" placeholder={t.appt.name} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="appt-phone" className="sr-only">
                    {t.appt.phone}
                  </label>
                  <input id="appt-phone" name="phone" type="tel" required autoComplete="tel" className="input-field" placeholder={t.appt.phone} />
                </div>
                <div>
                  <label htmlFor="appt-email" className="sr-only">
                    {t.appt.email}
                  </label>
                  <input id="appt-email" name="email" type="email" autoComplete="email" className="input-field" placeholder={t.appt.email} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="appt-date" className="sr-only">
                    {t.appt.date}
                  </label>
                  <input id="appt-date" name="date" type="date" className="input-field text-slate-500" />
                </div>
                <div>
                  <label htmlFor="appt-reason" className="sr-only">
                    {t.appt.reason}
                  </label>
                  <select id="appt-reason" name="reason" defaultValue="" className="input-field text-slate-500">
                    <option value="" disabled>
                      {t.appt.reason}
                    </option>
                    {t.appt.reasons.map((reason) => (
                      <option key={reason} value={reason}>
                        {reason}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-gradient w-full rounded-xl py-3.5 text-sm">
                <Send className="h-4 w-4" />
                {t.appt.submit}
              </button>
              {submitted && (
                <p role="status" className="rounded-xl bg-teal-50 px-4 py-3 text-xs font-semibold text-teal-700">
                  {t.appt.success}
                </p>
              )}
            </motion.form>

            <motion.div variants={fadeUp} className="glass min-w-0 space-y-5 rounded-3xl bg-white/60 p-5 shadow-soft sm:p-6">
              <InfoRow icon={<Phone className="h-4 w-4" />} value={t.appt.phoneValue} note={t.appt.placeholder} />
              <InfoRow icon={<Mail className="h-4 w-4" />} value={t.appt.emailValue} note={t.appt.placeholder} />
              <InfoRow icon={<Clock className="h-4 w-4" />} value={t.appt.hours} note={t.appt.hoursNote} />
              <p className="border-t border-slate-200/70 pt-4 text-center text-[11px] text-slate-500">{t.appt.urgent}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
