"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Search, SquarePen, Trash2 } from "lucide-react";
import {
  deleteCollectionItem,
  saveCollectionItem,
} from "@/app/actions/collections";
import {
  collectionFieldLabels,
  type CollectionContent,
  type CollectionItem,
  type CollectionName,
} from "@/lib/cms-collections";

const editableFields: (keyof CollectionContent["en"])[] = [
  "title",
  "description",
  "detail",
  "fieldOne",
  "fieldTwo",
  "url",
];

const emptyContent = (): CollectionContent => ({
  en: { title: "", description: "", detail: "", fieldOne: "", fieldTwo: "", url: "" },
  bn: { title: "", description: "", detail: "", fieldOne: "", fieldTwo: "", url: "" },
});

export default function CollectionManager({
  collection,
  title,
  initialItems,
}: {
  collection: CollectionName;
  title: string;
  initialItems: CollectionItem[];
}) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<CollectionItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? items.filter(
          (item) =>
            item.content.en.title.toLowerCase().includes(query) ||
            item.content.bn.title.includes(query),
        )
      : items;
  }, [items, search]);

  function newItem() {
    setMessage("");
    setEditing({
      id: "",
      content: emptyContent(),
      imageUrl: "",
      isPublished: collection !== "testimonials",
      displayOrder: items.length,
      date: "",
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);

    const content = {
      en: Object.fromEntries(
        editableFields.map((field) => [field, String(formData.get(`en.${field}`) ?? "").trim()]),
      ),
      bn: Object.fromEntries(
        editableFields.map((field) => [field, String(formData.get(`bn.${field}`) ?? "").trim()]),
      ),
    };
    const item = {
      collection,
      id: editing.id || undefined,
      content,
      imageUrl: String(formData.get("imageUrl") ?? "").trim(),
      isPublished: formData.get("isPublished") === "on",
      displayOrder: Number(formData.get("displayOrder") ?? 0),
      date: String(formData.get("date") ?? ""),
    };

    try {
      const result = await saveCollectionItem(item);
      if (!result.success) {
        setMessage(result.error || "Could not save this item.");
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Could not save CMS item", error);
      setMessage("Could not save this item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: CollectionItem) {
    if (!window.confirm(`Delete “${item.content.en.title}”? This cannot be undone.`)) {
      return;
    }

    const result = await deleteCollectionItem(collection, item.id);
    if (!result.success) {
      setMessage(result.error || "Could not delete this item.");
      return;
    }
    setItems((current) => current.filter((value) => value.id !== item.id));
    setMessage("Item deleted.");
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-teal-700">Content</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage bilingual content, visibility and display order.
          </p>
        </div>
        <button
          type="button"
          onClick={newItem}
          className="rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
        >
          Add {title.slice(0, -1).toLowerCase()}
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
        <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={`Search ${title.toLowerCase()}`}
          aria-label={`Search ${title.toLowerCase()}`}
          className="w-full border-0 bg-transparent py-3 text-sm outline-none"
        />
      </div>
      {message && (
        <p role="status" className="mt-3 text-sm text-slate-600">
          {message}
        </p>
      )}

      {filtered.length ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <ul className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4 sm:px-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
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
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(item)}
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
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">
            {items.length ? "No matching content" : `No ${title.toLowerCase()} yet`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Add an item to get started.
          </p>
        </div>
      )}

      {editing && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4 py-8"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditing(null);
          }}
        >
          <form
            onSubmit={submit}
            className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-xl sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editing.id ? "Edit" : "Add"} {title.slice(0, -1).toLowerCase()}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {editableFields
                .filter((field) => collectionFieldLabels[collection][field])
                .map((field) => (
                  <div key={field} className={field === "description" || field === "detail" ? "sm:col-span-2" : ""}>
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      {collectionFieldLabels[collection][field]}
                    </label>
                    <div className="grid gap-3 md:grid-cols-2">
                      {(["en", "bn"] as const).map((language) => {
                        const name = `${language}.${field}`;
                        const value = editing.content[language][field];
                        return (
                          <label key={language} className="text-[11px] text-slate-500">
                            {language === "en" ? "English" : "বাংলা"}
                            {field === "description" || field === "detail" ? (
                              <textarea
                                name={name}
                                defaultValue={value}
                                rows={field === "description" ? 3 : 2}
                                required={field === "description"}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                              />
                            ) : (
                              <input
                                name={name}
                                type={field === "url" ? "url" : "text"}
                                defaultValue={value}
                                required={field === "title"}
                                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                              />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              {collection !== "faq" && (
                <label className="text-xs font-medium text-slate-600">
                  Image URL
                  <input
                    name="imageUrl"
                    type="url"
                    defaultValue={editing.imageUrl}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                  />
                </label>
              )}
              {["achievements", "publications"].includes(collection) && (
                <label className="text-xs font-medium text-slate-600">
                  Date
                  <input
                    name="date"
                    type="date"
                    defaultValue={editing.date}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                  />
                </label>
              )}
              <label className="text-xs font-medium text-slate-600">
                Display order
                <input
                  name="displayOrder"
                  type="number"
                  min={0}
                  defaultValue={editing.displayOrder}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800"
                />
              </label>
              <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-700">
                <input
                  name="isPublished"
                  type="checkbox"
                  defaultChecked={editing.isPublished}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700"
                />
                Published
              </label>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <p role="status" className="text-sm text-red-700">{message}</p>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
