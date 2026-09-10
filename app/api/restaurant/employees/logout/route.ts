import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const VALID_ROLES = [
  "gerente",
  "cozinha",
  "caixa",
  "garcom",
] as const;

type EmployeeRole = (typeof VALID_ROLES)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const role = body.role as EmployeeRole | undefined;

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Cargo inválido." },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();

    const cookieName = `serve_employee_${role}`;

    const existingCookie = cookieStore.get(cookieName);

    if (!existingCookie) {
      return NextResponse.json({
        success: true,
      });
    }

    cookieStore.set(cookieName, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erro ao encerrar sessão do funcionário:",
      error,
    );

    return NextResponse.json(
      { error: "Erro interno ao encerrar sessão." },
      { status: 500 },
    );
  }
}