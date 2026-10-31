import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";

const isVercel = process.env.VERCEL === "1";

export async function saveUploadedImage(
  file: File,
  folder: string,
): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${randomUUID()}.${extension}`;

  if (isVercel) {
    const blob = await put(`${folder}/${fileName}`, file, {
      access: "public",
    });

    return blob.url;
  }

  const uploadDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    folder,
  );

  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(uploadDir, fileName), buffer);

  return `/uploads/${folder}/${fileName}`;
}

export async function deleteUploadedImage(
  imageUrl: string | null,
): Promise<void> {
  if (!imageUrl) return;

  try {
    if (imageUrl.startsWith("http")) {
      await del(imageUrl);
      return;
    }

    if (isVercel) return;

    const filePath = path.join(
      process.cwd(),
      "public",
      imageUrl.replace(/^\/+/, ""),
    );

    await unlink(filePath).catch(() => {});
  } catch (error) {
    console.error("Erro ao excluir imagem:", error);
  }
}