import { NextRequest, NextResponse } from "next/server";
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "db_serve",
});

async function applyPayment(
  conn: mysql.PoolConnection,
  accountId: number,
  customerName: string,
  value: number,
) {
  const [rows] = await conn.query(
    `SELECT oi.id, oi.quantity, oi.unit_price, oi.paid_amount
     FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id
     WHERE o.account_id = ? AND oi.customer_name = ? AND o.status != 'cancelado'
     ORDER BY oi.id ASC`,
    [accountId, customerName],
  );

  let remaining = value;

  for (const item of rows as any[]) {
    if (remaining <= 0) break;

    const itemTotal = Number(item.quantity) * Number(item.unit_price);
    const pending = itemTotal - Number(item.paid_amount);

    if (pending <= 0) continue;

    const applied = Math.min(pending, remaining);

    await conn.query(
      `UPDATE order_items SET paid_amount = paid_amount + ? WHERE id = ?`,
      [applied, item.id],
    );

    remaining -= applied;
  }
}

async function syncAccountPaid(conn: mysql.PoolConnection, accountId: number) {
  const [rows] = await conn.query(
    `SELECT SUM(oi.paid_amount) AS total FROM order_items oi
     INNER JOIN orders o ON o.id = oi.order_id
     WHERE o.account_id = ?`,
    [accountId],
  );

  const total = Number((rows as any[])[0]?.total || 0);

  await conn.query(`UPDATE table_accounts SET total_paid = ? WHERE id = ?`, [
    total,
    accountId,
  ]);
}

type CustomerItem = {
  id: number;
  name: string;
  image_url: string | null;
  quantity: number;
  unit_price: number;
  total: number;
};

type Customer = {
  name: string;
  total_consumed: number;
  total_paid: number;
  items: CustomerItem[];
};

type Account = {
  account_id: number;
  table_id: number;
  table_number: number;
  table_capacity: number;
  table_type: "mesa_quadrada" | "mesa_redonda" | "mesa_retangular" | "mesa_l";
  table_rotation: number;
  people_count: number;
  account_status: "aberta" | "conta_solicitada";
  total_consumed: number;
  total_paid: number;
  opened_at: string;
  customers: Customer[];
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const connection = await pool.getConnection();

  try {
    const { id: restaurantId } = await params;

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId é obrigatório." },
        { status: 400 },
      );
    }

    const [accountRows] = await connection.query(
      `
      SELECT
        ta.id AS account_id,
        ta.table_id,
        ta.status AS account_status,
        ta.total_consumed,
        ta.total_paid,
        ta.opened_at,

        t.number AS table_number,
        t.capacity AS table_capacity,
        t.type AS table_type,
        t.rotation AS table_rotation,

        (
          SELECT r.people_count
          FROM reservations r
          WHERE r.table_id = t.id
            AND r.restaurant_id = ?
            AND TIMESTAMP(r.reservation_date, r.reservation_time) <= NOW()
          ORDER BY
            TIMESTAMP(r.reservation_date, r.reservation_time) DESC,
            r.id DESC
          LIMIT 1
        ) AS people_count

      FROM table_accounts ta

      INNER JOIN tables t
        ON t.id = ta.table_id

      WHERE t.restaurant_id = ?
        AND ta.status IN ('aberta', 'conta_solicitada')

      ORDER BY t.number ASC
      `,
      [restaurantId, restaurantId],
    );

    const accounts: Account[] = (accountRows as any[]).map((row) => ({
      account_id: Number(row.account_id),
      table_id: Number(row.table_id),
      table_number: Number(row.table_number),
      table_capacity: Number(row.table_capacity),
      table_type: row.table_type,
      table_rotation: Number(row.table_rotation),
      people_count: row.people_count ? Number(row.people_count) : 0,
      account_status: row.account_status,
      total_consumed: Number(row.total_consumed),
      total_paid: Number(row.total_paid),
      opened_at: row.opened_at,
      customers: [],
    }));

    for (const account of accounts) {
      const [itemRows] = await connection.query(
        `
        SELECT
          oi.id,
          oi.customer_name,
          oi.quantity,
          oi.unit_price,
          oi.paid_amount,
          mi.name AS menu_item_name,
          mi.image_url

        FROM orders o

        INNER JOIN order_items oi
          ON oi.order_id = o.id

        INNER JOIN menu_items mi
          ON mi.id = oi.menu_item_id

        WHERE o.account_id = ?
          AND o.status != 'cancelado'

        ORDER BY
          oi.customer_name ASC,
          oi.created_at ASC,
          oi.id ASC
        `,
        [account.account_id],
      );

      const customersMap = new Map<string, Customer>();

      for (const row of itemRows as any[]) {
        const customerName = String(row.customer_name || "").trim();

        if (!customerName) continue;

        if (!customersMap.has(customerName)) {
          customersMap.set(customerName, {
            name: customerName,
            total_consumed: 0,
            total_paid: 0,
            items: [],
          });
        }

        const customer = customersMap.get(customerName);
        if (!customer) continue;

        const quantity = Number(row.quantity);
        const unitPrice = Number(row.unit_price);
        const itemTotal = quantity * unitPrice;

        customer.total_consumed += itemTotal;
        customer.total_paid += Number(row.paid_amount);

        customer.items.push({
          id: Number(row.id),
          name: row.menu_item_name,
          image_url: row.image_url,
          quantity,
          unit_price: unitPrice,
          total: itemTotal,
        });
      }

      account.customers = Array.from(customersMap.values());
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("Erro ao buscar contas das mesas:", error);

    return NextResponse.json(
      { error: "Erro interno ao buscar contas das mesas." },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const conn = await pool.getConnection();

  try {
    const { id: restaurantId } = await params;
    const body = await req.json();
    const { action, accountId } = body;

    const [accRows] = await conn.query(
      `SELECT ta.id FROM table_accounts ta
       INNER JOIN tables t ON t.id = ta.table_id
       WHERE ta.id = ? AND t.restaurant_id = ?
         AND ta.status IN ('aberta','conta_solicitada')
       LIMIT 1`,
      [accountId, restaurantId],
    );

    const account = (accRows as any[])[0];
    if (!account) {
      return NextResponse.json({ error: "Conta não encontrada." }, { status: 404 });
    }

    await conn.beginTransaction();

    if (action === "transferir") {
      const { orderItemId, toCustomer } = body;

      await conn.query(
        `UPDATE order_items oi
         INNER JOIN orders o ON o.id = oi.order_id
         SET oi.customer_name = ?
         WHERE oi.id = ? AND o.account_id = ?`,
        [toCustomer, orderItemId, account.id],
      );
    } else if (action === "pagar") {
      const { customerName } = body;
      const value = Number(body.value);

      if (!Number.isFinite(value) || value <= 0) {
        await conn.rollback();
        return NextResponse.json({ error: "Valor inválido." }, { status: 400 });
      }

      await applyPayment(conn, account.id, customerName, value);
    } else {
      await conn.rollback();
      return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
    }

    await syncAccountPaid(conn, account.id);
    await conn.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    await conn.rollback();
    console.error("Erro na ação do caixa:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  } finally {
    conn.release();
  }
}