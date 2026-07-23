import { db } from "../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";

// Carregar layout
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: restaurantId } = await params;

  try {
    const [tables] = await db.query(
      `SELECT * FROM tables WHERE restaurant_id = ?`,
      [restaurantId],
    );
    const [doors] = await db.query(
      `SELECT * FROM layout_items WHERE restaurant_id = ?`,
      [restaurantId],
    );
    const [walls] = await db.query(
      `SELECT * FROM layout_walls WHERE restaurant_id = ?`,
      [restaurantId],
    );
    const [floors] = await db.query(
      `SELECT * FROM layout_floors WHERE restaurant_id = ?`,
      [restaurantId],
    );

    return NextResponse.json({ tables, doors, walls, floors });
  } catch (err: any) {
  
    return NextResponse.json(
      {
        error: "Falha ao carregar layout",
        details: {
          message: err?.message,
          code: err?.code,
          errno: err?.errno,
          sqlState: err?.sqlState,
          sqlMessage: err?.sqlMessage,
        },
      },
      { status: 500 },
    );
  }
}

// Salvar layout
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: restaurantId } = await params;
  const { tables, doors, walls, floors } = await req.json();

  const connection = await db.getConnection();

  try {
    // Trava de segurança: não apaga mesas com conta aberta (ver observação abaixo)
    const [openAccounts] = await connection.query(
      `SELECT ta.id FROM table_accounts ta
       INNER JOIN tables t ON t.id = ta.table_id
       WHERE t.restaurant_id = ? AND ta.status != 'fechada'`,
      [restaurantId],
    );

    if ((openAccounts as any[]).length > 0) {
      return NextResponse.json(
        {
          error:
            "Existem mesas com contas abertas. Feche as contas antes de salvar o layout.",
        },
        { status: 409 },
      );
    }

    await connection.beginTransaction();

    await connection.query(`DELETE FROM tables WHERE restaurant_id = ?`, [
      restaurantId,
    ]);
    await connection.query(`DELETE FROM layout_items WHERE restaurant_id = ?`, [
      restaurantId,
    ]);
    await connection.query(`DELETE FROM layout_walls WHERE restaurant_id = ?`, [
      restaurantId,
    ]);
    await connection.query(
      `DELETE FROM layout_floors WHERE restaurant_id = ?`,
      [restaurantId],
    );

    for (const t of tables) {
      await connection.query(
        `INSERT INTO tables (restaurant_id, number, type, capacity, status, pos_x, pos_y, rotation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          restaurantId,
          t.tableNumber,
          t.type,
          t.capacity ?? 0,
          t.status ?? "livre",
          t.x,
          t.y,
          t.rotation ?? 0,
        ],
      );
    }

    for (const d of doors) {
      await connection.query(
        `INSERT INTO layout_items (restaurant_id, type, pos_x, pos_y, rotation, swing_right)
         VALUES (?, 'porta', ?, ?, ?, ?)`,
        [restaurantId, d.x, d.y, d.rotation ?? 0, d.swingDirection === "right"],
      );
    }

    for (const w of walls) {
      await connection.query(
        `INSERT INTO layout_walls (restaurant_id, wall_type, pos_x, pos_y, length, is_vertical)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [restaurantId, w.wallType, w.x, w.y, w.width, w.rotation === 90],
      );
    }

    for (const f of floors) {
      await connection.query(
        `INSERT INTO layout_floors (restaurant_id, pos_x, pos_y, width, height)
         VALUES (?, ?, ?, ?, ?)`,
        [restaurantId, f.x, f.y, f.width, f.height],
      );
    }

    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (err: any) {
    await connection.rollback();

    console.error("======================================");
    console.error("ERRO AO SALVAR LAYOUT");
    console.error("======================================");
    console.error("Mensagem:", err?.message);
    console.error("Código:", err?.code);
    console.error("Errno:", err?.errno);
    console.error("SQL State:", err?.sqlState);
    console.error("SQL Message:", err?.sqlMessage);
    console.error("SQL:", err?.sql);
    console.error("Stack:", err?.stack);
    console.error("Erro completo:", err);
    console.error("======================================");

    return NextResponse.json(
      {
        error: "Falha ao salvar layout",
        details: {
          message: err?.message,
          code: err?.code,
          errno: err?.errno,
          sqlState: err?.sqlState,
          sqlMessage: err?.sqlMessage,
        },
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
