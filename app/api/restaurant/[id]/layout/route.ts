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

//Salvar e atualizar o layout
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: restaurantId } = await params;
  const { tables, doors, walls, floors } = await req.json();

  const connection = await db.getConnection();

  try {
   
       const [occupiedRows] = await connection.query(
      `SELECT DISTINCT t.id, t.number, t.type, t.capacity, t.status, t.pos_x, t.pos_y, t.rotation
       FROM tables t
       LEFT JOIN table_accounts ta
         ON ta.table_id = t.id AND ta.status = 'aberta'
       LEFT JOIN reservations r
         ON r.table_id = t.id
         AND TIMESTAMP(r.reservation_date, r.reservation_time) > NOW()
       WHERE t.restaurant_id = ?
         AND (ta.table_id IS NOT NULL OR r.id IS NOT NULL)`,
      [restaurantId],
    );

    const occupied = occupiedRows as any[];

       const incomingByNumber = new Map<number, any>(
      tables.map((t: any) => [t.tableNumber, t]),
    );
    const blockedTableNumbers: number[] = [];

    for (const dbTable of occupied) {
      const incoming = incomingByNumber.get(dbTable.number);

      if (!incoming) {
        blockedTableNumbers.push(dbTable.number);
        continue;
      }

      const changed =
        incoming.type !== dbTable.type ||
        Number(incoming.capacity ?? 0) !== Number(dbTable.capacity) ||
        (incoming.status ?? "livre") !== dbTable.status ||
        Math.abs(Number(incoming.x) - Number(dbTable.pos_x)) > 0.5 ||
        Math.abs(Number(incoming.y) - Number(dbTable.pos_y)) > 0.5 ||
        Math.abs(Number(incoming.rotation ?? 0) - Number(dbTable.rotation)) >
          0.5;

      if (changed) {
        blockedTableNumbers.push(dbTable.number);
      }
    }

    if (blockedTableNumbers.length > 0) {
      return NextResponse.json(
        {
          error:
            "Existem mesas em uso sendo alteradas. Aguarde a mesa ficar livre para editar.",
          blockedTables: blockedTableNumbers,
        },
        { status: 409 },
      );
    }

    await connection.beginTransaction();

    const occupiedNumbers = new Set(occupied.map((o) => o.number));

    if (occupiedNumbers.size > 0) {
      await connection.query(
        `DELETE FROM tables WHERE restaurant_id = ? AND number NOT IN (?)`,
        [restaurantId, Array.from(occupiedNumbers)],
      );
    } else {
      await connection.query(`DELETE FROM tables WHERE restaurant_id = ?`, [
        restaurantId,
      ]);
    }

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
      if (occupiedNumbers.has(t.tableNumber)) continue;

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
