import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getEmployeeSession } from "../../../../../lib/employeeSession";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "db_serve",
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: restaurantId } = await params;

  try {
    const session = await getEmployeeSession("garcom");

    if (!session) {
      return NextResponse.json(
        { error: "Funcionário não autenticado." },
        { status: 401 },
      );
    }

    if (session.restaurantId !== Number(restaurantId)) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 },
      );
    }

    const [orders] = await pool.query(
      `
        SELECT
          o.id,
          o.status,
          o.created_at,
          o.waiter_employee_id,
          t.number AS table_number
        FROM orders o
        INNER JOIN table_accounts ta
          ON ta.id = o.account_id
        INNER JOIN tables t
          ON t.id = ta.table_id
        WHERE t.restaurant_id = ?
          AND o.waiter_employee_id = ?
          AND o.status = 'pronto'
        ORDER BY o.id DESC
        LIMIT 30
      `,
      [session.restaurantId, session.employeeId],
    );

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Erro ao buscar notificações do garçom:", error);

    return NextResponse.json(
      { error: "Erro ao buscar notificações." },
      { status: 500 },
    );
  }
}