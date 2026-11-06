import "server-only";

import { v2 as cloudinary } from "cloudinary";

const requiredCloudinaryVariables = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
] as const;

export function missingCloudinaryVariables() {
  return requiredCloudinaryVariables.filter(
    (name) => !process.env[name]?.trim(),
  );
}

export function cloudinaryConfigurationError(action: "upload" | "manage") {
  const missing = missingCloudinaryVariables();
  if (!missing.length) return null;

  return `Cloudinary ${action} is not configured. Add ${missing.join(", ")} to .env.local and restart the server.`;
}

export function getCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (
    !CLOUDINARY_CLOUD_NAME?.trim() ||
    !CLOUDINARY_API_KEY?.trim() ||
    !CLOUDINARY_API_SECRET?.trim()
  ) {
    const missing = missingCloudinaryVariables();
    throw new Error(`Cloudinary is not configured. Missing: ${missing.join(", ")}.`);
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  return cloudinary;
}
