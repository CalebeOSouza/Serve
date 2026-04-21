import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mysql from "mysql2/promise";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
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
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    const userId = users[0].id;

    const [rows]: any = await db.execute(
      `
      SELECT 
  r.id,
  r.name,
  r.description,
  r.city,
  r.state,
  r.status,
  r.type,
  r.parent_id,
  r.updated_at,

  COALESCE(pm.logo_url, m.logo_url)   AS logo_url,
  COALESCE(pm.banner_url, m.banner_url) AS banner_url

FROM restaurants r

LEFT JOIN restaurant_media m 
  ON m.restaurant_id = r.id

LEFT JOIN restaurants parent 
  ON parent.id = r.parent_id

LEFT JOIN restaurant_media pm 
  ON pm.restaurant_id = parent.id

WHERE r.user_id = ? AND r.onboarding_step = 0
ORDER BY r.created_at DESC 
      `,
      [userId],
    );

    return NextResponse.json({ restaurants: rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar restaurantes" },
      { status: 500 },
    );
  } finally {
    await db.end();
  }
}
