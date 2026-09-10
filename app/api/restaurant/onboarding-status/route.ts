import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import mysql from "mysql2/promise";

const NOTIFICATION_DELAY_HOURS = 0.05; //0.001 -> 3,6s //1

const DELETE_DELAY_HOURS = 24; //0.01 -> 1m48s //24

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "db_serve",
  });

  try {
    const [users]: any = await db.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [session.user.email],
    );

    if (!users.length) {
      return NextResponse.json({ exists: false });
    }

    const userId = users[0].id;

    await db.execute(
      `
      DELETE FROM restaurants
      WHERE user_id = ?
        AND onboarding_step != 0
        AND updated_at < NOW() - INTERVAL ? HOUR - INTERVAL 2 MINUTE
      `,
      [userId, DELETE_DELAY_HOURS],
    );

    const [rows]: any = await db.execute(
      `
      SELECT
        r.id,
        r.name,
        r.description,
        r.zipcode,
        r.street,
        r.number,
        r.neighborhood,
        r.city,
        r.state,
        r.onboarding_step,
        r.updated_at,
        m.logo_url,
        m.banner_url
      FROM restaurants r
      LEFT JOIN restaurant_media m
        ON m.restaurant_id = r.id
      WHERE r.user_id = ?
        AND r.onboarding_step != 0
        AND r.updated_at < NOW() - INTERVAL ? HOUR - INTERVAL 2 MINUTE
      ORDER BY r.updated_at DESC
      LIMIT 1
      `,
      [userId, NOTIFICATION_DELAY_HOURS],
    );

    if (!rows.length) {
      return NextResponse.json({ exists: false });
    }

    const restaurant = rows[0];

    return NextResponse.json({
      exists: true,
      restaurant: {
        id: restaurant.id,
        onboarding_step: restaurant.onboarding_step,
        updated_at: restaurant.updated_at,

        profile: {
          name: restaurant.name || "",
          description: restaurant.description || "",
          zipcode: restaurant.zipcode || "",
          street: restaurant.street || "",
          number: restaurant.number || "",
          neighborhood: restaurant.neighborhood || "",
          city: restaurant.city || "",
          state: restaurant.state || "",
        },

        media: {
          logo: restaurant.logo_url || null,
          banner: restaurant.banner_url || null,
        },
      },
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 },
    );
  } finally {
    await db.end();
  }
}