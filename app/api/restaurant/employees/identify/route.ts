import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "db_serve",
});

type EmployeeRole = "gerente" | "cozinha" | "caixa" | "garcom";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET não configurado.");
  }

  return secret;
}

function createEmployeeToken(
  employeeId: number,
  restaurantId: number,
  role: EmployeeRole,
) {
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  const payload = `${employeeId}.${restaurantId}.${role}.${expiresAt}`;

  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

function verifyEmployeeToken(token: string) {
  const parts = token.split(".");

  if (parts.length !== 5) {
    return null;
  }

  const [employeeId, restaurantId, role, expiresAt, signature] = parts;

  if (!employeeId || !restaurantId || !role || !expiresAt || !signature) {
    return null;
  }

  if (Number(expiresAt) < Date.now()) {
    return null;
  }

  const payload = `${employeeId}.${restaurantId}.${role}.${expiresAt}`;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const valid =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

  if (!valid) {
    return null;
  }

  return {
    employeeId: Number(employeeId),
    restaurantId: Number(restaurantId),
    role,
  };
}

export async function GET(req: NextRequest) {
  try {
    const restaurantId = Number(
      req.nextUrl.searchParams.get("restaurantId"),
    );

    const role = req.nextUrl.searchParams.get("role") as EmployeeRole;

    if (!restaurantId || !role) {
      return NextResponse.json(
        { error: "Dados de identificação não informados." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(`serve_employee_${role}`)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 },
      );
    }

    const session = verifyEmployeeToken(token);

    if (
      !session ||
      session.restaurantId !== restaurantId ||
      session.role !== role
    ) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 },
      );
    }

    const [rows] = await pool.query(
      `
        SELECT
          e.id,
          e.name
        FROM employees e
        INNER JOIN employee_roles er
          ON er.employee_id = e.id
        INNER JOIN roles r
          ON r.id = er.role_id
        WHERE e.id = ?
          AND e.restaurant_id = ?
          AND e.status = 'ativo'
          AND r.restaurant_id = ?
          AND r.type = ?
        LIMIT 1
      `,
      [
        session.employeeId,
        restaurantId,
        restaurantId,
        role,
      ],
    );

    const employee = (rows as any[])[0];

    if (!employee) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 },
      );
    }

    return NextResponse.json({
      authenticated: true,
      employee,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao verificar funcionário." },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const restaurantId = Number(body.restaurantId);
    const pin = String(body.pin || "")
      .trim()
      .toUpperCase();

    const role = body.role as EmployeeRole;

    if (!restaurantId || !pin || !role) {
      return NextResponse.json(
        { error: "PIN não informado." },
        { status: 400 },
      );
    }

    const [rows] = await pool.query(
      `
        SELECT
          e.id,
          e.name,
          e.restaurant_id,
          e.pin,
          e.status,
          r.type AS role_type
        FROM employees e
        INNER JOIN employee_roles er
          ON er.employee_id = e.id
        INNER JOIN roles r
          ON r.id = er.role_id
        WHERE e.restaurant_id = ?
          AND e.status = 'ativo'
          AND r.restaurant_id = ?
          AND r.type = ?
      `,
      [
        restaurantId,
        restaurantId,
        role,
      ],
    );

    const employees = rows as any[];

    let employee = null;

    for (const item of employees) {
      if (!item.pin) {
        continue;
      }

      const validPin = await bcrypt.compare(pin, item.pin);

      if (validPin) {
        employee = item;
        break;
      }
    }

    if (!employee) {
      return NextResponse.json(
        {
          error:
            "PIN inválido ou funcionário não autorizado para este cargo.",
        },
        { status: 401 },
      );
    }

    const token = createEmployeeToken(
      employee.id,
      restaurantId,
      role,
    );

    const cookieStore = await cookies();

    cookieStore.set(`serve_employee_${role}`, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro ao identificar funcionário." },
      { status: 500 },
    );
  }
}