import { db } from "../../../lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { restaurantId } = await req.json();

    const [[restaurant]]: any = await db.query(
      `SELECT * FROM restaurants WHERE id = ?`,
      [restaurantId]
    );

    if (!restaurant) {
      return NextResponse.json({ error: "Restaurante não encontrado" }, { status: 404 });
    }

    const profileOk =
      restaurant.name &&
      restaurant.zipcode &&
      restaurant.city &&
      restaurant.state;

    const [[menuCount]]: any = await db.query(
      `SELECT COUNT(*) as total FROM menu_items WHERE restaurant_id = ?`,
      [restaurantId]
    );

    const menuOk = menuCount.total > 0;

    // const mediaOk = restaurant.logo_url != null

    if (profileOk && menuOk) {
      await db.query(
        `UPDATE restaurants SET status = 'operacional' WHERE id = ?`,
        [restaurantId]
      );

      return NextResponse.json({ status: "operacional" });
    }

    return NextResponse.json({ status: "configurando" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro na validação" }, { status: 500 });
  }
}
