import { db } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type Day =
  | "segunda"
  | "terca"
  | "quarta"
  | "quinta"
  | "sexta"
  | "sabado"
  | "domingo";

type Hour = {
  enabled: boolean;
  open: string;
  close: string;
};

type HoursForm = Record<Day, Hour>;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.accountType !== "user") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const { restaurantId, hours }: { restaurantId: number; hours: HoursForm } =
      await req.json();

    if (!restaurantId || !hours) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const [restaurant]: any = await db.query(
      "SELECT id FROM restaurants WHERE id = ? AND user_id = ?",
      [restaurantId, userId],
    );

    if (!restaurant.length) {
      return NextResponse.json(
        { error: "Restaurante não encontrado" },
        { status: 404 },
      );
    }

    for (const [day, data] of Object.entries(hours)) {
      const [existing]: any = await db.query(
        `SELECT id FROM restaurant_hours 
     WHERE restaurant_id = ? AND day_of_week = ?`,
        [restaurantId, day],
      );

      if (existing.length > 0) {
        await db.query(
          `UPDATE restaurant_hours SET
         enabled = ?,
         open_time = ?,
         close_time = ?
       WHERE restaurant_id = ? AND day_of_week = ?`,
          [
            data.enabled ? 1 : 0,
            data.open || null,
            data.close || null,
            restaurantId,
            day,
          ],
        );
      } else {
        await db.query(
          `INSERT INTO restaurant_hours
        (restaurant_id, day_of_week, enabled, open_time, close_time)
       VALUES (?, ?, ?, ?, ?)`,
          [
            restaurantId,
            day,
            data.enabled ? 1 : 0,
            data.open || null,
            data.close || null,
          ],
        );
      }
    }

    await db.query(
      `UPDATE restaurants 
   SET onboarding_step = 0
   WHERE id = ?`,
      [restaurantId],
    );

    return NextResponse.json({ message: "Horários salvos com sucesso" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao salvar horários" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.accountType !== "user") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId obrigatório" },
        { status: 400 },
      );
    }

    const [rows]: any = await db.query(
      `SELECT day_of_week, enabled, open_time, close_time
       FROM restaurant_hours
       WHERE restaurant_id = ?`,
      [restaurantId],
    );

    const hours: any = {};

    rows.forEach((r: any) => {
      hours[r.day_of_week] = {
        enabled: !!r.enabled,
        open: r.open_time ? r.open_time.slice(0, 5) : "",
        close: r.close_time ? r.close_time.slice(0, 5) : "",
      };
    });

    return NextResponse.json(hours);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar horários" },
      { status: 500 },
    );
  }
}
