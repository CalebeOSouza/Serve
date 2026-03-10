import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mysql from "mysql2/promise";

export async function POST(req: Request) {

  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { restaurantId } = await req.json();

  if (!restaurantId) {
    return NextResponse.json({ error: "restaurantId obrigatório" }, { status: 400 });
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
      [session.user.email]
    );

    if (!users.length) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const userId = users[0].id;

    await db.execute(
      `
      UPDATE restaurants
      SET updated_at = NOW()
      WHERE id = ?
      AND user_id = ?
      `,
      [restaurantId, userId]
    );

    return NextResponse.json({ ok: true });

  } catch (error) {

    console.error("Erro heartbeat onboarding:", error);

    return NextResponse.json(
      { error: "Erro interno" },
      { status: 500 }
    );

  } finally {

    await db.end();

  }

}