import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    const cookiesToRemove = [
      "serve_employee_session",
      "serve_employee_gerente",
      "serve_employee_garcom",
      "serve_employee_cozinha",
      "serve_employee_caixa",
    ];

    for (const cookieName of cookiesToRemove) {
      cookieStore.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        expires: new Date(0),
        maxAge: 0,
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Erro ao encerrar sessão do funcionário:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro interno ao encerrar sessão.",
      },
      {
        status: 500,
      }
    );
  }
}