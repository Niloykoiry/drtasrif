"use client";

import { useRef, useState, type DragEvent } from "react";

export type UploadedMedia = {
  id: string;
  url: string;
  publicId: string;
  fileName: string;
  altText: { en: string; bn: string };
};

type UploadFolder =
  | "hero"
  | "about"
  | "blogs"
  | "services"
  | "achievements"
  | "publications"
  | "testimonials"
  | "gallery"
  | "before-after"
  | "general";

export default function ImageUploader({
  folder = "general",
  value,
  onChange,
  keepOnRemove = false,
}: {
  folder?: UploadFolder;
  value: UploadedMedia | null;
  onChange: (media: UploadedMedia | null) => void;
  keepOnRemove?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image files must be 10 MB or smaller.");
      return;
    }

    setBusy(true);
    setProgress(0);

    try {
      const signatureResponse = await fetch("/api/admin/media/sign-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      const signature = (await signatureResponse.json()) as {
        apiKey?: string;
        cloudName?: string;
        folder?: string;
        signature?: string;
        timestamp?: number;
        error?: string;
      };
      if (!signatureResponse.ok) {
        throw new Error(signature.error || "Could not authorize image upload.");
      }
      if (
        !signature.apiKey ||
        !signature.cloudName ||
        !signature.folder ||
        !signature.signature ||
        !signature.timestamp
      ) {
        throw new Error("The upload authorization response is incomplete.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.apiKey);
      formData.append("folder", signature.folder);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);

      const uploaded = await new Promise<{
        secure_url: string;
        public_id: string;
        format: string;
        width: number;
        height: number;
        bytes: number;
      }>((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        );
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            setProgress(Math.round((event.loaded / event.total) * 100));
          }
        };
        request.onload = () => {
          const response: unknown = JSON.parse(request.responseText);
          if (request.status < 200 || request.status >= 300) {
            const message =
              response &&
              typeof response === "object" &&
              "error" in response &&
              response.error &&
              typeof response.error === "object" &&
              "message" in response.error
                ? String(response.error.message)
                : "Cloudinary upload failed.";
            reject(new Error(message));
            return;
          }
          resolve(response as typeof uploaded);
        };
        request.onerror = () => reject(new Error("Image upload network error."));
        request.send(formData);
      });

      const mediaResponse = await fetch("/api/admin/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: uploaded.secure_url,
          publicId: uploaded.public_id,
          fileName: file.name,
          format: uploaded.format,
          width: uploaded.width,
          height: uploaded.height,
          bytes: uploaded.bytes,
          altText: { en: "", bn: "" },
        }),
      });
      const result = (await mediaResponse.json()) as {
        media?: UploadedMedia;
        error?: string;
      };
      if (!mediaResponse.ok || !result.media) {
        throw new Error(result.error || "Could not save uploaded media details.");
      }

      onChange(result.media);
      setProgress(100);
    } catch (uploadError) {
      console.error("Image upload failed", uploadError);
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!value) return;
    if (keepOnRemove) {
      onChange(null);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/media/${encodeURIComponent(value.id)}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not delete this image.");
      onChange(null);
    } catch (removeError) {
      console.error("Image deletion failed", removeError);
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Could not delete this image.",
      );
    } finally {
      setBusy(false);
    }
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    void upload(event.dataTransfer.files[0]);
  }

  return (
    <div>
      {value ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <img
            src={value.url}
            alt={value.altText.en || value.fileName}
            className="aspect-video w-full rounded-xl object-cover"
          />
          <p className="mt-2 truncate text-xs text-slate-500">{value.fileName}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Replace image
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          className="rounded-2xl border-2 border-dashed border-slate-300 bg-white px-5 py-8 text-center"
        >
          <p className="text-sm font-medium text-slate-700">
            Drop an image here or{" "}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-teal-700 underline underline-offset-2"
            >
              browse files
            </button>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG, WebP or GIF · up to 10 MB
          </p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          void upload(event.target.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      {busy && (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="h-2 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-teal-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {progress ? `Uploading ${progress}%` : "Preparing upload…"}
          </p>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
