import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

type Body = {
  type: "admin" | "cliente";
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  if (session.user.accountType !== "user") {
    return NextResponse.json(
      { error: "Este tipo de conta não pode alterar perfil" },
      { status: 403 }
    );
  }

  const body = (await req.json()) as Body;

  if (!["admin", "cliente"].includes(body.type)) {
    return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
  }

  const userId = Number(session.user.id);

  if (!userId) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  await db.query(
    "UPDATE users SET user_type = ? WHERE id = ?",
    [body.type, userId]
  );

  return NextResponse.json({ ok: true });
}
