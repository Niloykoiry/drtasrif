"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveSiteSection } from "@/app/actions/site-sections";
import {
  applySectionOverrides,
  flattenStrings,
  type EditableSection,
  type LocalizedSectionOverrides,
} from "@/lib/content-translations";
import { getDefaultDictionary, type Lang } from "@/lib/i18n";

const formSchema = z.object({
  en: z.record(z.string(), z.string().max(20_000)),
  bn: z.record(z.string(), z.string().max(20_000)),
});

type FormValues = {
  en: Record<string, unknown>;
  bn: Record<string, unknown>;
};

function toFormRecord(value: unknown): Record<string, unknown> {
  if (Array.isArray(value)) {
    return Object.fromEntries(
      value.map((item, index) => [String(index), toFormValue(item)]),
    );
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, toFormValue(item)]),
    );
  }
  throw new Error("Section defaults must be an object or array.");
}

function toFormValue(value: unknown): unknown {
  if (typeof value === "string") return value;
  return toFormRecord(value);
}

const languageNames: Record<Lang, string> = {
  en: "English",
  bn: "বাংলা",
};

function humanize(path: string) {
  return path
    .split(".")
    .map((part) => (/^\d+$/.test(part) ? `Item ${Number(part) + 1}` : part))
    .join(" / ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (value) => value.toUpperCase());
}

export default function SectionEditor({
  section,
  title,
  savedValues,
  excludePaths = [],
}: {
  section: EditableSection;
  title: string;
  savedValues: LocalizedSectionOverrides | null;
  excludePaths?: string[];
}) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const defaults = useMemo(() => {
    const makeDefaults = (language: Lang) => {
      const dict = getDefaultDictionary(language);
      const sectionDefaults =
        section === "base"
          ? { cta: dict.cta, close: dict.close }
          : dict[section];
      return toFormRecord(
        applySectionOverrides(sectionDefaults, savedValues?.[language]),
      );
    };

    return { en: makeDefaults("en"), bn: makeDefaults("bn") };
  }, [section, savedValues]);

  const flattenedDefaults = useMemo(
    () => ({
      en: flattenStrings(defaults.en),
      bn: flattenStrings(defaults.bn),
    }),
    [defaults],
  );

  const fields = useMemo(
    () => {
      const allFields = new Set([
        ...Object.keys(flattenedDefaults.en),
        ...Object.keys(flattenedDefaults.bn),
      ]);
      return [...allFields].filter(
        (path) =>
          !excludePaths.some(
            (excluded) =>
              path === excluded || path.startsWith(`${excluded}.`),
          ),
      );
    },
    [excludePaths, flattenedDefaults],
  );

  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm<FormValues>({ defaultValues: defaults });

  function flattenVisibleFields(value: Record<string, unknown>) {
    return Object.fromEntries(
      Object.entries(flattenStrings(value)).filter(
        ([path]) =>
          !excludePaths.some(
            (excluded) =>
              path === excluded || path.startsWith(`${excluded}.`),
          ),
      ),
    );
  }

  async function onSubmit(values: FormValues) {
    setSaving(true);
    setMessage("");
    try {
      const content = {
        en: flattenVisibleFields(values.en),
        bn: flattenVisibleFields(values.bn),
      };
      const parsed = formSchema.safeParse(content);
      if (!parsed.success) {
        setMessage("Some fields are too long. Shorten them and try again.");
        return;
      }

      const result = await saveSiteSection(
        section,
        parsed.data,
      );
      setMessage(
        result.success
          ? "Changes saved and published."
          : result.error || "Unable to save these changes.",
      );
    } catch (error) {
      console.error("Could not save CMS section", error);
      setMessage("Unable to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div>
        <p className="text-sm font-medium text-teal-700">Website content</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Update the English and Bengali text shown on the public website.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
          {fields.map((path) => {
            const label = humanize(path);
            const large = Math.max(
              flattenedDefaults.en[path]?.length ?? 0,
              flattenedDefaults.bn[path]?.length ?? 0,
            ) > 100;

          return (
            <section
              key={path}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="mb-4 text-sm font-semibold text-slate-800">
                {label}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {(["en", "bn"] as const).map((language) => {
                  const name = `${language}.${path}` as `en.${string}` | `bn.${string}`;
                  const fieldId = `${language}-${path.replaceAll(".", "-")}`;

                  return (
                    <div key={language}>
                      <label
                        htmlFor={fieldId}
                        className="mb-1.5 block text-xs font-medium text-slate-500"
                      >
                        {languageNames[language]}
                      </label>
                      {large ? (
                        <textarea
                          id={fieldId}
                          rows={4}
                          {...register(name)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        />
                      ) : (
                        <input
                          id={fieldId}
                          {...register(name)}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
        <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur">
          <p role="status" className="text-sm text-slate-600">
            {message || (isDirty ? "You have unsaved changes." : "")}
          </p>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-wait disabled:opacity-70"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
