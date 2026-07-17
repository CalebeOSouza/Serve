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

    // =========================
    // VALIDAÇÕES
    // =========================

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "Campos obrigatórios ausentes",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "A senha deve ter no mínimo 6 caracteres",
        },
        {
          status: 400,
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "Email inválido",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // HASH DA SENHA
    // =========================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================
    // CRIA USUÁRIO
    // =========================

    const [result]: any = await db.query(
      `
      INSERT INTO users
      (
        name,
        email,
        password,
        status
      )
      VALUES
      (
        ?, ?, ?, 'pendente'
      )
      `,
      [name, email, hashedPassword]
    );

    const userId = result.insertId;

    // =========================
    // RESPONSE
    // =========================

    return NextResponse.json(
      {
        message: "Conta criada com sucesso",
        userId,
      },
      {
        status: 201,
      }
    );
  } catch (error: any) {
    // EMAIL DUPLICADO

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          error: "Este e-mail já está cadastrado",
        },
        {
          status: 400,
        }
      );
    }

    console.error("Erro no cadastro:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
      },
      {
        status: 500,
      }
    );
  }
}