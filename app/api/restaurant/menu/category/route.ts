import { db } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

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
  SELECT id, parent_id, name
  FROM menu_categories
  WHERE restaurant_id = ?
  ORDER BY
    parent_id ASC,
    CASE
      WHEN parent_id IS NOT NULL AND name = 'Produtos' THEN 0
      ELSE 1
    END,
    id ASC
  `,
      [restaurantId],
    );

    const categories = rows
      .filter((row: any) => row.parent_id === null)
      .map((category: any) => ({
        id: category.id,
        name: category.name,
        subcategories: rows
          .filter((row: any) => row.parent_id === category.id)
          .sort((a: any, b: any) => {
            if (a.name === "Produtos") return -1;
            if (b.name === "Produtos") return 1;
            return a.id - b.id;
          })
          .map((sub: any) => ({
            id: sub.id,
            name: sub.name,
          })),
      }));

    return NextResponse.json(categories);
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao buscar categorias." },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const { restaurantId, name, parentId } = await req.json();

    const [exists]: any = await db.query(
      `
      SELECT id
      FROM menu_categories
      WHERE
      restaurant_id=?
      AND ${parentId ? "parent_id=?" : "parent_id IS NULL"}
      AND LOWER(name)=LOWER(?)
      `,
      parentId ? [restaurantId, parentId, name] : [restaurantId, name],
    );

    if (exists.length > 0) {
      return NextResponse.json(
        {
          error: parentId
            ? "Já existe uma subcategoria com esse nome."
            : "Já existe uma categoria com esse nome.",
        },
        { status: 400 },
      );
    }

    const [result]: any = await db.query(
      `
      INSERT INTO menu_categories
      (
        restaurant_id,
        parent_id,
        name
      )
      VALUES
      (?, ?, ?)
      `,
      [restaurantId, parentId ?? null, name],
    );

    return NextResponse.json({
      id: result.insertId,
      name,
      parentId: parentId ?? null,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Erro ao criar categoria." },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { restaurantId, id, name, parentId } = await req.json();

    const [exists]: any = await db.query(
      `
  SELECT id
  FROM menu_categories
  WHERE restaurant_id=?
  AND ${
    parentId === null || parentId === undefined
      ? "parent_id IS NULL"
      : "parent_id=?"
  }
  AND LOWER(name)=LOWER(?)
  AND id<>?
  `,
      parentId === null || parentId === undefined
        ? [restaurantId, name, id]
        : [restaurantId, parentId, name, id],
    );

    if (exists.length > 0) {
      return NextResponse.json(
        {
          error:
            parentId === null || parentId === undefined
              ? "Já existe uma categoria com esse nome."
              : "Já existe uma subcategoria com esse nome.",
        },
        {
          status: 400,
        },
      );
    }

    await db.query(
      `
      UPDATE menu_categories
      SET name=?
      WHERE id=?
      `,
      [name, id],
    );

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Erro ao editar categoria.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = Number(req.nextUrl.searchParams.get("id"));

    const [subs]: any = await db.query(
      `
      SELECT id
      FROM menu_categories
      WHERE parent_id=?
      `,
      [id],
    );

    for (const sub of subs) {
      await db.query(
        `
        DELETE FROM menu_items
        WHERE category_id=?
        `,
        [sub.id],
      );
    }

    await db.query(
      `
      DELETE FROM menu_categories
      WHERE parent_id=?
      `,
      [id],
    );

    await db.query(
      `
      DELETE FROM menu_categories
      WHERE id=?
      `,
      [id],
    );

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: "Erro ao excluir categoria.",
      },
      {
        status: 500,
      },
    );
  }
}
