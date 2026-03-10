import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import { db } from "../../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const MAX_SIZE = 4 * 1024 * 1024; // Banner pode ser maior (4MB)
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const data = await req.formData();
    const file = data.get("file") as File;
    const restaurantId = data.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId não enviado" },
        { status: 400 },
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Arquivo não enviado" },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de imagem inválido" },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Banner muito grande (máx 4MB)" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `banner_${Date.now()}_${file.name.replace(/\s/g, "_")}`;
    const filePath = path.join(
      process.cwd(),
      "public/uploads/banners",
      fileName,
    );
    await writeFile(filePath, buffer);

    const bannerUrl = `/uploads/banners/${fileName}`;

    const [media]: any = await db.query(
      "SELECT banner_url FROM restaurant_media WHERE restaurant_id = ?",
      [restaurantId],
    );

    if (media.length === 0) {
      await db.query(
        "INSERT INTO restaurant_media (restaurant_id, banner_url) VALUES (?, ?)",
        [restaurantId, bannerUrl],
      );
    } else {
      const oldBanner = media[0].banner_url;

      await db.query(
        "UPDATE restaurant_media SET banner_url = ? WHERE restaurant_id = ?",
        [bannerUrl, restaurantId],
      );

      if (oldBanner) {
        const oldPath = path.join(process.cwd(), "public", oldBanner);
        await unlink(oldPath).catch(() => {});
      }
    }

    await db.query(
      `UPDATE restaurants 
   SET onboarding_step = 3
   WHERE id = ?`,
      [restaurantId],
    );

    return NextResponse.json({ success: true, bannerUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar banner" },
      { status: 500 },
    );
  }
}
