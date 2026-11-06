import { z } from "zod";
import { getCurrentAdmin } from "@/lib/admin";
import { db } from "@/lib/db";

const mediaSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1).max(255),
  fileName: z.string().min(1).max(255),
  format: z.string().min(1).max(20),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  bytes: z.number().int().positive().optional(),
  altText: z.object({ en: z.string().max(500), bn: z.string().max(500) }),
});

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json();
  const parsed = mediaSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid media details." }, { status: 400 });
  }

  const mediaUrl = new URL(parsed.data.url);
  if (
    mediaUrl.protocol !== "https:" ||
    mediaUrl.hostname !== "res.cloudinary.com" ||
    !parsed.data.publicId.startsWith("dr-tasrif/")
  ) {
    return Response.json({ error: "Invalid Cloudinary asset." }, { status: 400 });
  }

  const media = await db.media.create({ data: parsed.data });
  return Response.json({ media }, { status: 201 });
}
