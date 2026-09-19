import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const restaurantId = Number(id);

    if (!restaurantId || Number.isNaN(restaurantId)) {
      return NextResponse.json(
        { error: "Restaurante inválido." },
        { status: 400 },
      );
    }

    const [logs] = await db.query(
      `
        SELECT
          el.id,
          el.employee_id,
          e.name AS employee_name,
          el.system_account,
          el.action_description,
          el.created_at
        FROM employee_logs el
        INNER JOIN employees e
          ON e.id = el.employee_id
        WHERE el.restaurant_id = ?
        ORDER BY el.created_at DESC
      `,
      [restaurantId],
    );

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Erro ao carregar logs:", error);

    return NextResponse.json(
      { error: "Erro ao carregar os logs." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const restaurantId = Number(id);

    if (!restaurantId || Number.isNaN(restaurantId)) {
      return NextResponse.json(
        { error: "Restaurante inválido." },
        { status: 400 },
      );
    }

    await db.query(
      `
        DELETE FROM employee_logs
        WHERE restaurant_id = ?
      `,
      [restaurantId],
    );

    return NextResponse.json({
      success: true,
      message: "Todos os logs foram removidos.",
    });
  } catch (error) {
    console.error("Erro ao limpar logs:", error);

    return NextResponse.json(
      { error: "Erro ao limpar os logs." },
      { status: 500 },
    );
  }
}
