import { z } from "zod";
import { getCurrentAdmin } from "@/lib/admin";
import {
  cloudinaryConfigurationError,
  getCloudinary,
} from "@/lib/cloudinary";

const folders = [
  "hero",
  "about",
  "blogs",
  "services",
  "achievements",
  "publications",
  "testimonials",
  "gallery",
  "before-after",
  "general",
] as const;

const requestSchema = z.object({
  folder: z.enum(folders),
});

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const configurationError = cloudinaryConfigurationError("upload");
  if (configurationError) {
    return Response.json(
      { error: configurationError },
      { status: 503 },
    );
  }

  const body: unknown = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid upload folder." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `dr-tasrif/${parsed.data.folder}`;
  const signature = getCloudinary().utils.api_sign_request(
    { folder, timestamp },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return Response.json({
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    signature,
    timestamp,
  });
}
