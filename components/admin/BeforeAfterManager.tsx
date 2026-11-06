"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import {
  deleteBeforeAfterCase,
  saveBeforeAfterCase,
} from "@/app/actions/before-after";
import ImageUploader, {
  type UploadedMedia,
} from "@/components/admin/ImageUploader";

type ManagedCase = {
  id: string;
  content: {
    en: { title: string; description: string };
    bn: { title: string; description: string };
  };
  beforeImage: UploadedMedia;
  afterImage: UploadedMedia;
  isPublished: boolean;
  displayOrder: number;
};

type EditingCase = Omit<ManagedCase, "beforeImage" | "afterImage">;

const emptyContent = {
  en: { title: "", description: "" },
  bn: { title: "", description: "" },
};

export default function BeforeAfterManager({
  initialItems,
}: {
  initialItems: ManagedCase[];
}) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<EditingCase | null>(null);
  const [beforeImage, setBeforeImage] = useState<UploadedMedia | null>(null);
  const [afterImage, setAfterImage] = useState<UploadedMedia | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function startNew() {
    setMessage("");
    setBeforeImage(null);
    setAfterImage(null);
    setEditing({
      id: "",
      content: emptyContent,
      isPublished: true,
      displayOrder: items.length,
    });
  }

  function startEdit(item: ManagedCase) {
    setMessage("");
    setBeforeImage(item.beforeImage);
    setAfterImage(item.afterImage);
    setEditing({
      id: item.id,
      content: item.content,
      isPublished: item.isPublished,
      displayOrder: item.displayOrder,
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    if (!beforeImage || !afterImage) {
      setMessage("Upload both a before image and an after image.");
      return;
    }

    setSaving(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const input = {
      id: editing.id || undefined,
      content: {
        en: {
          title: String(formData.get("en.title") ?? ""),
          description: String(formData.get("en.description") ?? ""),
        },
        bn: {
          title: String(formData.get("bn.title") ?? ""),
          description: String(formData.get("bn.description") ?? ""),
        },
      },
      beforeImageId: beforeImage.id,
      afterImageId: afterImage.id,
      isPublished: formData.get("isPublished") === "on",
      displayOrder: Number(formData.get("displayOrder") ?? 0),
    };

    try {
      const result = await saveBeforeAfterCase(input);
      if (!result.success) {
        setMessage(result.error || "Could not save this case.");
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Could not save before-and-after case", error);
      setMessage("Could not save this case. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: ManagedCase) {
    if (!window.confirm(`Delete "${item.content.en.title}"? This cannot be undone.`)) {
      return;
    }
    setMessage("");
    try {
      const result = await deleteBeforeAfterCase(item.id);
      if (!result.success) {
        setMessage(result.error || "Could not delete this case.");
        return;
      }
      setItems((current) => current.filter((value) => value.id !== item.id));
      setMessage("Case deleted.");
    } catch (error) {
      console.error("Could not delete before-and-after case", error);
      setMessage("Could not delete this case. Please try again.");
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Content</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Before &amp; After
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Upload both images, add a bilingual surgery title and description, and publish the case.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/before-after-text"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Edit section text
          </Link>
          <button
            type="button"
            onClick={startNew}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add case
          </button>
        </div>
      </div>

      {message && (
        <p role="status" className="mt-4 text-sm text-slate-600">
          {message}
        </p>
      )}

      {items.length ? (
        <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="grid grid-cols-2">
                <img
                  src={item.beforeImage.url}
                  alt={`Before: ${item.content.en.title}`}
                  className="aspect-[4/3] w-full object-cover"
                />
                <img
                  src={item.afterImage.url}
                  alt={`After: ${item.content.en.title}`}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.content.en.title}
                  </p>
                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      item.isPublished
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.isPublished ? "Published" : "Draft"}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">Order {item.displayOrder}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    aria-label={`Edit ${item.content.en.title}`}
                    className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  >
                    <SquarePen className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    aria-label={`Delete ${item.content.en.title}`}
                    className="rounded-lg border border-red-200 p-2 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">No cases yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Add a case to display it in the Before &amp; After section.
          </p>
        </div>
      )}

      {editing && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) setEditing(null);
          }}
        >
          <form
            onSubmit={submit}
            className="w-full max-w-5xl rounded-2xl bg-white p-5 shadow-xl sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editing.id ? "Edit case" : "Add case"}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                disabled={saving}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {(
                [
                  ["Before image", beforeImage, setBeforeImage],
                  ["After image", afterImage, setAfterImage],
                ] as const
              ).map(([label, image, setImage]) => (
                <div key={label}>
                  <h3 className="mb-2 text-sm font-semibold text-slate-800">{label}</h3>
                  <ImageUploader
                    folder="before-after"
                    value={image}
                    onChange={setImage}
                    keepOnRemove
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {(["title", "description"] as const).map((field) => (
                <div key={field}>
                  <h3 className="mb-2 text-sm font-semibold capitalize text-slate-800">
                    Surgery {field}
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {(["en", "bn"] as const).map((language) => {
                      const name = `${language}.${field}`;
                      const value = editing.content[language][field];
                      return (
                        <label key={language} className="text-xs font-medium text-slate-600">
                          {language === "en" ? "English" : "বাংলা"}
                          {field === "description" ? (
                            <textarea
                              name={name}
                              defaultValue={value}
                              rows={3}
                              required
                              maxLength={20_000}
                              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                            />
                          ) : (
                            <input
                              name={name}
                              type="text"
                              defaultValue={value}
                              required
                              maxLength={500}
                              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                            />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="flex flex-wrap items-end gap-5">
                <label className="text-xs font-medium text-slate-600">
                  Display order
                  <input
                    name="displayOrder"
                    type="number"
                    min={0}
                    max={100_000}
                    defaultValue={editing.displayOrder}
                    required
                    className="mt-1.5 block w-36 rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                  />
                </label>
                <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                  <input
                    name="isPublished"
                    type="checkbox"
                    defaultChecked={editing.isPublished}
                    className="h-4 w-4 rounded border-slate-300 text-teal-700"
                  />
                  Published on website
                </label>
              </div>
            </div>

            {message && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {message}
              </p>
            )}
            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save case"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
