import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mysql from "mysql2/promise";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "db_serve",
  });

  try {
    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId é obrigatório" },
        { status: 400 },
      );
    }

    const [restaurants]: any = await db.execute(
      `
  SELECT id, name, description, city, state, status
  FROM restaurants
  WHERE id = ?
  LIMIT 1
  `,
      [restaurantId],
    );

    if (!restaurants.length) {
      return NextResponse.json(
        { error: "Restaurante não encontrado" },
        { status: 404 },
      );
    }

    const restaurant = restaurants[0];

    const [mediaRows]: any = await db.execute(
      `
  SELECT logo_url, banner_url
  FROM restaurant_media
  WHERE restaurant_id = ?
  LIMIT 1
  `,
      [restaurant.id],
    );

    const [hoursRows]: any = await db.execute(
      `
      SELECT day_of_week, enabled, open_time, close_time
      FROM restaurant_hours
      WHERE restaurant_id = ?
      ORDER BY FIELD(
        day_of_week,
        'segunda','terca','quarta','quinta','sexta','sabado','domingo'
      )
      `,
      [restaurant.id],
    );

    return NextResponse.json({
      ...restaurant,
      media: mediaRows[0] ?? {
        logo_url: null,
        banner_url: null,
      },
      hours: hoursRows,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar restaurante" },
      { status: 500 },
    );
  } finally {
    await db.end();
  }
}

