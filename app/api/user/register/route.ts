import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: RegisterBody = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await db.query(
      `
      INSERT INTO users 
        (name, email, password, user_type, status)
      VALUES 
        (?, ?, ?, 'NULL', 'pendente')
      `,
      [name, email, hashedPassword],
    );

    const userId = result.insertId;

    const response = NextResponse.json(
      {
        message: "Conta criada com sucesso",
        userId,
      },
      { status: 201 },
    );

    response.cookies.set("session", String(userId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado" },
        { status: 400 },
      );
    }

    console.error("Erro no cadastro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 },
    );
  }
}
