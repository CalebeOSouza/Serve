import { db } from "../../../../lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

function gerarUsername(name: string, type: string, role: string) {
  const normalizedName = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "");

  return `${role}_${normalizedName}`.slice(0, 50);
}

export async function POST(req: Request) {
  try {
    const { password, restaurantId } = await req.json();

    if (!password || !restaurantId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres" },
        { status: 400 },
      );
    }

    const regexSenha = /^(?=.*[A-Za-z])(?=.*\d).+$/;

    if (!regexSenha.test(password)) {
      return NextResponse.json(
        { error: "A senha deve conter pelo menos 1 letra e 1 número" },
        { status: 400 },
      );
    }

    const [restaurants]: any = await db.query(
      `SELECT name FROM restaurants WHERE id = ?`,
      [restaurantId],
    );

    if (!restaurants.length) {
      return NextResponse.json(
        { error: "Restaurante não encontrado" },
        { status: 404 },
      );
    }

    const { name, type } = restaurants[0];

    const roles = ["gerente", "cozinha", "caixa", "garcom"];

    const hashedPassword = await bcrypt.hash(password, 10);

    for (const role of roles) {
      const username = gerarUsername(name, type, role);

      await db.query(
        `
    INSERT INTO roles (type, username, password, restaurant_id)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      password = VALUES(password)
    `,
        [role, username, hashedPassword, restaurantId],
      );
    }
    return NextResponse.json({
      message: "Senha definida com sucesso",
    });
  } catch (err: any) {
    console.error(err);

    return NextResponse.json(
      { error: "Erro ao salvar senha" },
      { status: 500 },
    );
  }
}
