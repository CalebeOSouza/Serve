import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

interface ProfileBody {
  id?: number;
  name: string;
  description: string;
  zipcode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.accountType !== "user") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const [users]: any = await db.query(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [session.user.email]
    );

    if (!users.length) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const userId = users[0].id;

    const body: ProfileBody = await req.json();

    const {
      id,
      name,
      description,
      zipcode,
      street,
      number,
      neighborhood,
      city,
      state,
    } = body;

    if (
      !name?.trim() ||
      !zipcode ||
      !city ||
      !state ||
      !neighborhood ||
      !street ||
      !number
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios" },
        { status: 400 }
      );
    }

    const safeDescription = description || null;

    const [sameAddress]: any = await db.query(
      `SELECT id FROM restaurants 
       WHERE LOWER(TRIM(street)) = LOWER(TRIM(?))
       AND number = ?
       AND LOWER(TRIM(neighborhood)) = LOWER(TRIM(?))
       AND LOWER(TRIM(city)) = LOWER(TRIM(?))
       AND LOWER(TRIM(state)) = LOWER(TRIM(?))
       ${id ? "AND id != ?" : ""}`,
      id
        ? [street, number, neighborhood, city, state, id]
        : [street, number, neighborhood, city, state]
    );

    if (sameAddress.length > 0) {
      return NextResponse.json(
        { error: "Já existe restaurante nesse endereço" },
        { status: 400 }
      );
    }

    if (id) {
      await db.query(
        `UPDATE restaurants SET 
          name=?, description=?,
          zipcode=?, street=?, number=?, neighborhood=?, city=?, state=?
         WHERE id=? AND user_id=?`,
        [
          name,
          safeDescription,
          zipcode,
          street,
          number,
          neighborhood,
          city,
          state,
          id,
          userId,
        ]
      );

      revalidatePath("/my-restaurants");

      return NextResponse.json({
        message: "Atualizado com sucesso",
        restaurantId: id,
      });
    }

    const [result]: any = await db.query(
      `INSERT INTO restaurants
      (user_id, name, description, zipcode, street, number, neighborhood, city, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        safeDescription,
        zipcode,
        street,
        number,
        neighborhood,
        city,
        state,
      ]
    );

    const restaurantId = result.insertId;

    revalidatePath("/my-restaurants");

    return NextResponse.json({
      message: "Restaurante criado com sucesso",
      restaurantId,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Erro interno",
      },
      { status: 500 }
    );
  }
}
