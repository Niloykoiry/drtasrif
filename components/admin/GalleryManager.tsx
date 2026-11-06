"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { Plus, SquarePen, Trash2 } from "lucide-react";
import { deleteGalleryItem, saveGalleryItem } from "@/app/actions/gallery";
import ImageUploader, {
  type UploadedMedia,
} from "@/components/admin/ImageUploader";

type GalleryContent = {
  en: { title: string; meta: string; desc: string; full: string };
  bn: { title: string; meta: string; desc: string; full: string };
};

export type AdminGalleryItem = {
  id: string;
  content: GalleryContent;
  image: UploadedMedia;
  isPublished: boolean;
  displayOrder: number;
};

type EditingGalleryItem = Omit<AdminGalleryItem, "image">;

const emptyContent: GalleryContent = {
  en: { title: "", meta: "", desc: "", full: "" },
  bn: { title: "", meta: "", desc: "", full: "" },
};

export default function GalleryManager({
  initialItems,
}: {
  initialItems: AdminGalleryItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<EditingGalleryItem | null>(null);
  const [image, setImage] = useState<UploadedMedia | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? items.filter(
          (item) =>
            item.content.en.title.toLowerCase().includes(query) ||
            item.content.bn.title.includes(query),
        )
      : items;
  }, [items, search]);

  function startNew() {
    setMessage("");
    setImage(null);
    setEditing({
      id: "",
      content: emptyContent,
      isPublished: true,
      displayOrder: items.length,
    });
  }

  function startEdit(item: AdminGalleryItem) {
    setMessage("");
    setImage(item.image);
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
    if (!image) {
      setMessage("Upload a gallery image before saving.");
      return;
    }

    setSaving(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const content: GalleryContent = {
      en: {
        title: String(formData.get("en.title") ?? ""),
        meta: String(formData.get("en.meta") ?? ""),
        desc: String(formData.get("en.desc") ?? ""),
        full: String(formData.get("en.full") ?? ""),
      },
      bn: {
        title: String(formData.get("bn.title") ?? ""),
        meta: String(formData.get("bn.meta") ?? ""),
        desc: String(formData.get("bn.desc") ?? ""),
        full: String(formData.get("bn.full") ?? ""),
      },
    };

    try {
      const result = await saveGalleryItem({
        id: editing.id || undefined,
        content,
        imageId: image.id,
        isPublished: formData.get("isPublished") === "on",
        displayOrder: Number(formData.get("displayOrder") ?? 0),
      });
      if (!result.success) {
        setMessage(result.error || "Could not save this gallery item.");
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Could not save gallery item", error);
      setMessage("Could not save this gallery item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: AdminGalleryItem) {
    if (!window.confirm(`Delete "${item.content.en.title}"? This cannot be undone.`)) {
      return;
    }
    setMessage("");
    try {
      const result = await deleteGalleryItem(item.id);
      if (!result.success) {
        setMessage(result.error || "Could not delete this gallery item.");
        return;
      }
      setItems((current) => current.filter((value) => value.id !== item.id));
      setMessage("Gallery item deleted.");
    } catch (error) {
      console.error("Could not delete gallery item", error);
      setMessage("Could not delete this gallery item. Please try again.");
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Website content</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Gallery
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Upload photos and manage bilingual captions, stories, visibility, and display order.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/gallery-text"
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
            Add gallery item
          </button>
        </div>
      </div>

      <label className="mt-6 block">
        <span className="sr-only">Search gallery items</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search gallery items"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
        />
      </label>

      {message && (
        <p role="status" className="mt-3 text-sm text-slate-600">
          {message}
        </p>
      )}

      {filteredItems.length ? (
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <li
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <img
                src={item.image.url}
                alt={item.content.en.title}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {item.content.en.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500">
                    {item.content.bn.title}
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
                  <p className="mt-2 text-xs text-slate-500">
                    Display order: {item.displayOrder}
                  </p>
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
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">
            {items.length ? "No matching gallery items" : "No gallery items yet"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add an item to display a photo and story in the website gallery.
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
                {editing.id ? "Edit gallery item" : "Add gallery item"}
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

            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold text-slate-800">Gallery photo</h3>
              <ImageUploader
                folder="gallery"
                value={image}
                onChange={setImage}
                keepOnRemove
              />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {(["en", "bn"] as const).map((language) => (
                <section
                  key={language}
                  className="space-y-4 rounded-xl border border-slate-200 p-4"
                >
                  <h3 className="text-sm font-semibold text-teal-800">
                    {language === "en" ? "English" : "বাংলা"}
                  </h3>
                  <label className="block text-xs font-medium text-slate-600">
                    Title
                    <input
                      name={`${language}.title`}
                      defaultValue={editing.content[language].title}
                      required
                      maxLength={500}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Location or event
                    <input
                      name={`${language}.meta`}
                      defaultValue={editing.content[language].meta}
                      maxLength={2_000}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Short description
                    <textarea
                      name={`${language}.desc`}
                      defaultValue={editing.content[language].desc}
                      required
                      maxLength={20_000}
                      rows={3}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                    />
                  </label>
                  <label className="block text-xs font-medium text-slate-600">
                    Full story
                    <textarea
                      name={`${language}.full`}
                      defaultValue={editing.content[language].full}
                      required
                      maxLength={20_000}
                      rows={6}
                      className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                    />
                  </label>
                </section>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-5">
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
                {saving ? "Saving…" : "Save gallery item"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
