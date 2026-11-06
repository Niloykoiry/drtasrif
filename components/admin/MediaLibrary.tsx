"use client";

import { useMemo, useState } from "react";
import ImageUploader, { type UploadedMedia } from "@/components/admin/ImageUploader";

export default function MediaLibrary({
  initialMedia,
}: {
  initialMedia: UploadedMedia[];
}) {
  const [media, setMedia] = useState(initialMedia);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return media;
    return media.filter(
      (item) =>
        item.fileName.toLowerCase().includes(query) ||
        item.publicId.toLowerCase().includes(query) ||
        item.altText.en.toLowerCase().includes(query) ||
        item.altText.bn.includes(query),
    );
  }, [media, search]);

  async function saveAltText(item: UploadedMedia, formData: FormData) {
    const altText = {
      en: String(formData.get("altEn") ?? "").trim(),
      bn: String(formData.get("altBn") ?? "").trim(),
    };
    const response = await fetch(`/api/admin/media/${encodeURIComponent(item.id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(altText),
    });
    const result = (await response.json()) as {
      media?: UploadedMedia;
      error?: string;
    };
    if (!response.ok || !result.media) {
      setStatus(result.error || "Could not save alternative text.");
      return;
    }

    setMedia((items) =>
      items.map((current) => (current.id === item.id ? result.media! : current)),
    );
    setStatus("Alternative text saved.");
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url);
    setStatus("Image URL copied.");
  }

  async function remove(item: UploadedMedia) {
    const confirmed = window.confirm(
      `Delete ${item.fileName}? Ensure it is not used in published content.`,
    );
    if (!confirmed) return;

    const response = await fetch(`/api/admin/media/${encodeURIComponent(item.id)}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus(result.error || "Could not delete the image.");
      return;
    }

    setMedia((items) => items.filter((current) => current.id !== item.id));
    setStatus("Image deleted.");
  }

  return (
    <div>
      <div>
        <p className="text-sm font-medium text-teal-700">Assets</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          Media library
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Upload and manage images stored in Cloudinary.
        </p>
      </div>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-800">Upload image</h2>
        <ImageUploader
          folder="general"
          value={null}
          onChange={(uploaded) => {
            if (uploaded) setMedia((items) => [uploaded, ...items]);
          }}
        />
      </section>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          All media <span className="text-sm font-normal text-slate-500">({media.length})</span>
        </h2>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search filename, ID or alt text"
          aria-label="Search media"
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
        />
      </div>
      {status && (
        <p role="status" className="mt-3 text-sm text-slate-600">
          {status}
        </p>
      )}

      {filtered.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <img
                src={item.url}
                alt={item.altText.en || item.fileName}
                className="aspect-[4/3] w-full bg-slate-100 object-cover"
              />
              <div className="space-y-3 p-4">
                <div>
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {item.fileName}
                  </p>
                  <p className="mt-1 break-all text-[11px] text-slate-500">
                    {item.publicId}
                  </p>
                </div>
                <form
                  action={(formData) => saveAltText(item, formData)}
                  className="space-y-2"
                >
                  <label className="block text-xs text-slate-500">
                    English alt text
                    <input
                      name="altEn"
                      defaultValue={item.altText.en}
                      maxLength={500}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                    />
                  </label>
                  <label className="block text-xs text-slate-500">
                    Bengali alt text
                    <input
                      name="altBn"
                      defaultValue={item.altText.bn}
                      maxLength={500}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
                  >
                    Save alt text
                  </button>
                </form>
                <div className="flex gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => void copyUrl(item.url)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Copy URL
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(item)}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <p className="text-sm font-semibold text-slate-700">
            {media.length ? "No media matches your search" : "No media uploaded yet"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Uploaded images will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
