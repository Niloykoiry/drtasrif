import { z } from "zod";
import { getCurrentAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import {
  cloudinaryConfigurationError,
  getCloudinary,
} from "@/lib/cloudinary";

const altTextSchema = z.object({
  en: z.string().max(500),
  bn: z.string().max(500),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await request.json();
  const parsed = altTextSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid alternative text." }, { status: 400 });
  }

  const { id } = await params;
  const media = await db.media.update({
    where: { id },
    data: { altText: parsed.data },
    select: { id: true, url: true, publicId: true, fileName: true, altText: true },
  });

  return Response.json({ media });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const configurationError = cloudinaryConfigurationError("manage");
  if (configurationError) {
    return Response.json(
      { error: configurationError },
      { status: 503 },
    );
  }

  const { id } = await params;
  const media = await db.media.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          blogPosts: true,
          beforeAfterBefore: true,
          beforeAfterAfter: true,
          galleryItems: true,
        },
      },
    },
  });
  if (!media) return Response.json({ error: "Media not found." }, { status: 404 });
  if (
    media._count.blogPosts > 0 ||
    media._count.beforeAfterBefore > 0 ||
    media._count.beforeAfterAfter > 0 ||
    media._count.galleryItems > 0
  ) {
    return Response.json(
      { error: "This image is in use and cannot be deleted yet." },
      { status: 409 },
    );
  }

  const result = await getCloudinary().uploader.destroy(media.publicId, {
    resource_type: "image",
  });
  if (result.result !== "ok" && result.result !== "not found") {
    return Response.json(
      { error: "Cloudinary did not confirm image deletion." },
      { status: 502 },
    );
  }

  await db.media.delete({ where: { id } });
  return Response.json({ success: true });
}
