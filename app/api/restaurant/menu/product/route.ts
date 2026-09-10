import { db } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

async function deleteImage(imageUrl: string | null) {
  if (!imageUrl) return;

  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      imageUrl.replace(/^\//, ""),
    );

    await fs.unlink(filePath);
  } catch {}
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId é obrigatório." },
        { status: 400 },
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT
        mi.id,
        mi.category_id AS categoryId,
        mi.name,
        mi.description,
        mi.price,
        mi.image_url AS imageUrl,
        mi.available
      FROM menu_items mi
      INNER JOIN menu_categories mc ON mc.id = mi.category_id
      WHERE mc.restaurant_id = ?
      ORDER BY mi.id ASC
      `,
      [restaurantId],
    );

    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao buscar produtos." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const restaurantId = formData.get("restaurantId") as string;
    const categoryIdRaw = formData.get("categoryId") as string | null;
    const parentCategoryIdRaw = formData.get("parentCategoryId") as
      | string
      | null;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = formData.get("price") as string;
    const image = formData.get("image") as File | null;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

    const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

    if (image) {
      const extension = image.name.split(".").pop()?.toLowerCase() ?? "";

      if (
        !allowedTypes.includes(image.type) ||
        !allowedExtensions.has(extension)
      ) {
        return NextResponse.json(
          {
            error:
              "Formato inválido. Utilize apenas JPG, JPEG, PNG, WEBP ou GIF.",
          },
          { status: 400 },
        );
      }
    }

    if (!restaurantId || !name || !price || !image) {
      return NextResponse.json(
        { error: "Nome, preço e imagem são obrigatórios." },
        { status: 400 },
      );
    }

    if (!categoryIdRaw && !parentCategoryIdRaw) {
      return NextResponse.json(
        { error: "categoryId ou parentCategoryId é obrigatório." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(Number(restaurantId)) || Number(restaurantId) <= 0) {
      return NextResponse.json(
        {
          error: "restaurantId inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const restaurantIdNumber = Number(restaurantId);

    let targetCategoryId: number;
    let createdSubcategory: { id: number; name: string } | null = null;

    if (categoryIdRaw) {
      targetCategoryId = Number(categoryIdRaw);

      const [categoryRows]: any = await db.query(
        `
    SELECT id
    FROM menu_categories
    WHERE id = ?
      AND restaurant_id = ?
    `,
        [targetCategoryId, restaurantIdNumber],
      );

      if (categoryRows.length === 0) {
        return NextResponse.json(
          {
            error: "Categoria não encontrada neste restaurante.",
          },
          {
            status: 404,
          },
        );
      }
    } else {
      const parentCategoryId = Number(parentCategoryIdRaw);

      const [parentRows]: any = await db.query(
        `
  SELECT id
  FROM menu_categories
  WHERE id = ?
    AND restaurant_id = ?
    AND parent_id IS NULL
  `,
        [parentCategoryId, restaurantIdNumber],
      );

      if (parentRows.length === 0) {
        return NextResponse.json(
          {
            error: "Categoria principal não encontrada neste restaurante.",
          },
          {
            status: 404,
          },
        );
      }

      const [existing]: any = await db.query(
        `
        SELECT id, name
        FROM menu_categories
        WHERE restaurant_id = ? AND parent_id = ? AND LOWER(name) = LOWER(?)
        `,
        [restaurantId, parentCategoryId, "Produtos"],
      );

      if (existing.length > 0) {
        targetCategoryId = existing[0].id;
      } else {
        const [result]: any = await db.query(
          `
          INSERT INTO menu_categories (restaurant_id, parent_id, name)
          VALUES (?, ?, ?)
          `,
          [restaurantId, parentCategoryId, "Produtos"],
        );

        targetCategoryId = result.insertId;
        createdSubcategory = { id: targetCategoryId, name: "Produtos" };
      }
    }

    let imageUrl: string | null = null;

    if (image && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const extension = image.name.split(".").pop();
      const fileName = `${randomUUID()}.${extension}`;

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "products",
      );
      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(path.join(uploadDir, fileName), buffer);

      imageUrl = `/uploads/products/${fileName}`;
    }

    const [result]: any = await db.query(
      `
  INSERT INTO menu_items (
    category_id,
    name,
    description,
    price,
    image_url,
    available
  )
  VALUES (?, ?, ?, ?, ?, ?)
  `,
      [targetCategoryId, name, description || null, price, imageUrl, true],
    );

    return NextResponse.json({
      id: result.insertId,
      categoryId: targetCategoryId,
      name,
      description: description || null,
      price,
      imageUrl,
      available: true,
      createdSubcategory,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Erro ao criar produto." },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();

    const id = Number(formData.get("id"));
    const restaurantId = Number(formData.get("restaurantId"));

    if (!restaurantId || !id) {
      return NextResponse.json(
        {
          error: "restaurantId e id são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          error: "Id inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const availableRaw = formData.get("available");

    if (availableRaw !== null) {
      if (availableRaw !== "true" && availableRaw !== "false") {
        return NextResponse.json(
          {
            error: "Valor de disponibilidade inválido.",
          },
          {
            status: 400,
          },
        );
      }

      const available = availableRaw === "true";

      const [rows]: any = await db.query(
        `
  SELECT mi.id
  FROM menu_items mi
  INNER JOIN menu_categories mc
    ON mc.id = mi.category_id
  WHERE mi.id = ?
    AND mc.restaurant_id = ?
  `,
        [id, restaurantId],
      );

      if (rows.length === 0) {
        return NextResponse.json(
          {
            error: "Produto não encontrado.",
          },
          {
            status: 404,
          },
        );
      }

      await db.query(
        `
  UPDATE menu_items mi
  INNER JOIN menu_categories mc
    ON mc.id = mi.category_id
  SET mi.available = ?
  WHERE mi.id = ?
    AND mc.restaurant_id = ?
  `,
        [available, id, restaurantId],
      );

      return NextResponse.json({
        success: true,
        id,
        available,
      });
    }

    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") as string | null;

    const image = formData.get("image") as File | null;

    if (!name || !price) {
      return NextResponse.json(
        {
          error: "Nome e preço são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    const [rows]: any = await db.query(
      `
  SELECT
    mi.image_url,
    mi.available
  FROM menu_items mi
  INNER JOIN menu_categories mc
    ON mc.id = mi.category_id
  WHERE mi.id = ?
    AND mc.restaurant_id = ?
  `,
      [id, restaurantId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Produto não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    let imageUrl = rows[0].image_url;

    if (image && image.size > 0) {
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];

      const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif"]);

      const extension = image.name.split(".").pop()?.toLowerCase() ?? "";

      if (
        !allowedTypes.includes(image.type) ||
        !allowedExtensions.has(extension)
      ) {
        return NextResponse.json(
          {
            error:
              "Formato inválido. Utilize apenas JPG, JPEG, PNG, WEBP ou GIF.",
          },
          {
            status: 400,
          },
        );
      }

      await deleteImage(imageUrl);

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${randomUUID()}.${extension}`;

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "products",
      );

      await fs.mkdir(uploadDir, {
        recursive: true,
      });

      await fs.writeFile(path.join(uploadDir, fileName), buffer);

      imageUrl = `/uploads/products/${fileName}`;
    }

    await db.query(
      `
     UPDATE menu_items mi
INNER JOIN menu_categories mc
  ON mc.id = mi.category_id
SET
  mi.name = ?,
  mi.description = ?,
  mi.price = ?,
  mi.image_url = ?
WHERE mi.id = ?
  AND mc.restaurant_id = ?
      `,
      [name, description || null, price, imageUrl, id, restaurantId],
    );

    return NextResponse.json({
      success: true,
      id,
      name,
      description: description || null,
      price,
      imageUrl,
      available: Boolean(rows[0].available),
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao editar produto.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const id = Number(searchParams.get("id"));
    const restaurantId = Number(searchParams.get("restaurantId"));

    if (!id || !restaurantId) {
      return NextResponse.json(
        {
          error: "restaurantId e id são obrigatórios.",
        },
        {
          status: 400,
        },
      );
    }

    if (!id) {
      return NextResponse.json(
        {
          error: "Id inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const [rows]: any = await db.query(
      `
      SELECT mi.image_url
FROM menu_items mi
INNER JOIN menu_categories mc
  ON mc.id = mi.category_id
WHERE mi.id = ?
  AND mc.restaurant_id = ?
      `,
      [id, restaurantId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Produto não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    await deleteImage(rows[0].image_url);

    await db.query(
      `
      DELETE mi
FROM menu_items mi
INNER JOIN menu_categories mc
  ON mc.id = mi.category_id
WHERE mi.id = ?
  AND mc.restaurant_id = ?
      `,
      [id, restaurantId],
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao excluir produto.",
      },
      {
        status: 500,
      },
    );
  }
}