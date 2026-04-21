import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

function generatePin() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";

  let pin = "";

  for (let i = 0; i < 3; i++) {
    pin += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  for (let i = 0; i < 3; i++) {
    pin += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  return pin;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { employeeId } = await req.json();

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId obrigatório" },
        { status: 400 },
      );
    }

    const [roles]: any = await db.query(
      `
    SELECT r.type 
    FROM employee_roles er
    JOIN roles r ON r.id = er.role_id
    WHERE er.employee_id = ?
  `,
      [employeeId],
    );

    if (roles.length === 0) {
      return NextResponse.json(
        { error: "Funcionário sem cargos vinculados" },
        { status: 400 },
      );
    }
    const isManager = roles.some((r: any) => r.type === "gerente");

    if (isManager) {
      return NextResponse.json(
        { error: "Gerente não possui PIN" },
        { status: 400 },
      );
    }

    const plainPin = generatePin();
    const hashedPin = await bcrypt.hash(plainPin, 10);

    const [empRows]: any = await db.query(
      `SELECT cpf FROM employees WHERE id = ?`,
      [employeeId],
    );

    const cpf = empRows[0].cpf;

    await db.query(`UPDATE employees SET pin = ? WHERE cpf = ?`, [
      hashedPin,
      cpf,
    ]);

    return NextResponse.json({
      pin: plainPin,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro ao gerar PIN" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId obrigatório" },
        { status: 400 },
      );
    }

    const [rows]: any = await db.query(
      `SELECT pin FROM employees WHERE id = ?`,
      [employeeId],
    );

    const hasPin = !!rows[0]?.pin;

    return NextResponse.json({ hasPin });
  } catch (err) {
    return NextResponse.json(
      { error: "Erro ao verificar PIN" },
      { status: 500 },
    );
  }
}
