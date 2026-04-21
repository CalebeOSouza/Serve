import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId é obrigatório" },
        { status: 400 }
      );
    }

    const [rows] = await db.query(
      `
      SELECT type, username
      FROM roles
      WHERE restaurant_id = ?
      `,
      [restaurantId]
    );

    return NextResponse.json({
      roles: rows,
    });
  } catch (error) {
    console.error("Erro ao buscar roles:", error);

    return NextResponse.json(
      { error: "Erro ao buscar roles" },
      { status: 500 }
    );
  }
}