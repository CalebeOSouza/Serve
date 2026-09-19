import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { getEmployeeSession } from "../../../../lib/employeeSession";
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "db_serve",
});

const VALID_ROLES = ["gerente", "cozinha", "caixa", "garcom"] as const;

type EmployeeRole = (typeof VALID_ROLES)[number];

export async function GET(req: NextRequest) {
  try {
    const role = req.nextUrl.searchParams.get("role");

    if (!role || !VALID_ROLES.includes(role as EmployeeRole)) {
      return NextResponse.json({ error: "Cargo inválido." }, { status: 400 });
    }

    if (role === "gerente") {
      const nextAuthSession = await getServerSession(authOptions);

      if (
        !nextAuthSession ||
        !(
          (nextAuthSession.user.accountType === "user" &&
            String(nextAuthSession.user.role).toLowerCase() === "admin") ||
          (nextAuthSession.user.accountType === "role" &&
            String(nextAuthSession.user.role).toLowerCase() === "gerente")
        )
      ) {
        return NextResponse.json(
          { error: "Funcionário não identificado." },
          { status: 401 },
        );
      }

      return NextResponse.json({
        id: nextAuthSession.user.id,
        name: "Gerente",
        role: "gerente",
        active: true,
      });
    }

    const session = await getEmployeeSession(role as EmployeeRole);

    if (!session) {
      return NextResponse.json(
        { error: "Funcionário não identificado." },
        { status: 401 },
      );
    }

    const [rows] = await pool.query(
      `
        SELECT
          e.id,
          e.name,
          e.status,
          r.type AS role
        FROM employees e

        INNER JOIN employee_roles er
          ON er.employee_id = e.id

        INNER JOIN roles r
          ON r.id = er.role_id

        WHERE e.id = ?
          AND e.restaurant_id = ?
          AND r.restaurant_id = ?
          AND r.type = ?

        LIMIT 1
      `,
      [session.employeeId, session.restaurantId, session.restaurantId, role],
    );

    const employees = rows as {
      id: number;
      name: string;
      status: "ativo" | "inativo";
      role: EmployeeRole;
    }[];

    if (employees.length === 0) {
      return NextResponse.json(
        { error: "Funcionário não encontrado." },
        { status: 404 },
      );
    }

    const employee = employees[0];

    return NextResponse.json({
      id: employee.id,
      name: employee.name,
      role: employee.role,
      active: employee.status === "ativo",
    });
  } catch (error) {
    console.error("Erro ao carregar funcionário atual:", error);

    return NextResponse.json(
      { error: "Erro interno ao carregar funcionário." },
      { status: 500 },
    );
  }
}
