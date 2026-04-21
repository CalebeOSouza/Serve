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
  type: "matriz" | "filial";
  parentId?: number | null;
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
      type,
      parentId,
    } = body;

    if (
      !name?.trim() ||
      !zipcode ||
      !city ||
      !state ||
      !neighborhood ||
      !street ||
      !number ||
      !type
    ) {
      return NextResponse.json(
        { error: "Preencha todos os campos obrigatórios" },
        { status: 400 }
      );
    }

    const safeDescription = description || null;

    if (type === "matriz") {
      const [existingMatrix]: any = await db.query(
        `SELECT id FROM restaurants 
         WHERE type='matriz' 
         AND user_id=? 
         AND LOWER(TRIM(name)) = LOWER(TRIM(?)) 
         ${id ? "AND id != ?" : ""}`,
        id ? [userId, name, id] : [userId, name]
      );

      if (existingMatrix.length > 0) {
        return NextResponse.json(
          { error: "Você já possui uma matriz com esse nome" },
          { status: 400 }
        );
      }
    }

    if (type === "filial") {
      if (!parentId) {
        return NextResponse.json(
          { error: "Filial precisa de uma matriz" },
          { status: 400 }
        );
      }

      const [matrix]: any = await db.query(
        `SELECT id, name, user_id, status
         FROM restaurants 
         WHERE id=? AND type='matriz'`,
        [parentId]
      );

      if (!matrix.length) {
        return NextResponse.json(
          { error: "Matriz não encontrada" },
          { status: 400 }
        );
      }

      const m = matrix[0];

      if (m.user_id !== userId) {
        return NextResponse.json(
          { error: "Matriz não pertence ao usuário" },
          { status: 403 }
        );
      }

      if (m.status !== "operacional") {
        return NextResponse.json(
          { error: "Matriz precisa estar operacional" },
          { status: 400 }
        );
      }

      if (m.name.trim().toLowerCase() !== name.trim().toLowerCase()) {
        return NextResponse.json(
          { error: "Nome da filial deve ser igual ao da matriz" },
          { status: 400 }
        );
      }
    }

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
          name=?, description=?, type=?, parent_id=?,
          zipcode=?, street=?, number=?, neighborhood=?, city=?, state=?
         WHERE id=? AND user_id=?`,
        [
          name,
          safeDescription,
          type,
          type === "filial" ? parentId : null,
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
      (user_id, name, description, type, parent_id, zipcode, street, number, neighborhood, city, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        safeDescription,
        type,
        type === "filial" ? parentId : null,
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
      message:
        type === "matriz"
          ? "Matriz criada com sucesso"
          : "Filial criada com sucesso",
      restaurantId,
    });

  } catch (err: any) {
    console.error("ERRO REAL:", err);

    return NextResponse.json(
      {
        error: err.message || "Erro interno",
      },
      { status: 500 }
    );
  }
}
