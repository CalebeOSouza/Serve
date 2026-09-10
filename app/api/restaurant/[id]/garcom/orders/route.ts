import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { getEmployeeSession } from "../../../../../lib/employeeSession";
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "db_serve",
});

async function createEmployeeLog(
  connection: mysql.PoolConnection,
  restaurantId: string,
  employeeId: number,
  description: string,
) {
  await connection.query(
    `
      INSERT INTO employee_logs (
        restaurant_id,
        employee_id,
        system_account,
        action_description
      )
      VALUES (?, ?, 'garçom', ?)
    `,
    [restaurantId, employeeId, description.slice(0, 255)],
  );
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const restaurantId = id;

    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");

    if (!restaurantId) {
      return NextResponse.json(
        {
          error: "restaurantId é obrigatório.",
        },
        { status: 400 },
      );
    }

    const [categoryRows] = await pool.query(
      `
      SELECT
        id,
        name,
        display_order
      FROM menu_categories
      WHERE restaurant_id = ?
        AND parent_id IS NULL
        AND active = TRUE
      ORDER BY display_order ASC, id ASC
      `,
      [restaurantId],
    );

    const [subcategoryRows] = await pool.query(
      `
      SELECT
        id,
        parent_id,
        name,
        display_order
      FROM menu_categories
      WHERE restaurant_id = ?
        AND parent_id IS NOT NULL
        AND active = TRUE
      ORDER BY display_order ASC, id ASC
      `,
      [restaurantId],
    );

    const [itemRows] = await pool.query(
      `
      SELECT
        id,
        category_id,
        name,
        description,
        price,
        image_url,
        available
      FROM menu_items
      WHERE category_id IN (
        SELECT id
        FROM menu_categories
        WHERE restaurant_id = ?
          AND active = TRUE
      )
      ORDER BY id ASC
      `,
      [restaurantId],
    );

    const categories = (categoryRows as any[]).map((category) => {
      const subcategories = (subcategoryRows as any[])
        .filter(
          (subcategory) =>
            Number(subcategory.parent_id) === Number(category.id),
        )
        .map((subcategory) => {
          const items = (itemRows as any[])
            .filter(
              (item) => Number(item.category_id) === Number(subcategory.id),
            )
            .map((item) => ({
              id: Number(item.id),
              category_id: Number(item.category_id),
              name: item.name,
              description: item.description,
              price: Number(item.price),
              image_url: item.image_url,
              available: Boolean(item.available),
            }));

          return {
            id: Number(subcategory.id),
            name: subcategory.name,
            items,
          };
        });

      return {
        id: Number(category.id),
        name: category.name,
        subcategories,
      };
    });

    const view = searchParams.get("view");

    if (view === "panel") {
      const [panelRows] = await pool.query(
        `
    SELECT
  t.id AS table_id,
  t.number AS table_number,

  o.id AS order_id,
      o.status AS order_status,
      o.created_at AS order_created_at,

      oi.id AS order_item_id,
      oi.menu_item_id,
      oi.customer_name,
      oi.quantity,
      oi.unit_price,
      oi.observation,

      mi.name AS menu_item_name

    FROM table_accounts ta

    INNER JOIN tables t
      ON t.id = ta.table_id

    INNER JOIN orders o
      ON o.account_id = ta.id

    LEFT JOIN order_items oi
      ON oi.order_id = o.id

    LEFT JOIN menu_items mi
      ON mi.id = oi.menu_item_id

    WHERE ta.status = 'aberta'
      AND t.restaurant_id = ?

    ORDER BY
      o.created_at ASC,
      oi.id ASC
    `,
        [restaurantId],
      );

      const tablesMap = new Map<number, any>();

      for (const row of panelRows as any[]) {
        const tableId = Number(row.table_id);

        if (!tablesMap.has(tableId)) {
          tablesMap.set(tableId, {
            table_id: tableId,
            table_number: Number(row.table_number),
            orders: [],
          });
        }

        const table = tablesMap.get(tableId);

        const orderId = Number(row.order_id);

        let order = table.orders.find((item: any) => item.id === orderId);

        if (!order) {
          order = {
            id: orderId,
            status: row.order_status,
            created_at: row.order_created_at,
            items: [],
          };

          table.orders.push(order);
        }

        if (row.order_item_id) {
          order.items.push({
            id: Number(row.order_item_id),
            menu_item_id: Number(row.menu_item_id),
            name: row.menu_item_name,
            customer_name: row.customer_name,
            quantity: Number(row.quantity),
            unit_price: Number(row.unit_price),
            observation: row.observation,
          });
        }
      }

      return NextResponse.json({
        categories,
        tables: Array.from(tablesMap.values()),
      });
    }

    if (!tableId) {
      return NextResponse.json({
        categories,
        orders: [],
      });
    }

    const [accountRows] = await pool.query(
      `
      SELECT
        id
      FROM table_accounts
      WHERE table_id = ?
        AND status = 'aberta'
      ORDER BY opened_at DESC
      LIMIT 1
      `,
      [tableId],
    );

    const account = (accountRows as any[])[0];

    if (!account) {
      return NextResponse.json({
        categories,
        orders: [],
      });
    }

    const [orderRows] = await pool.query(
      `
      SELECT
        o.id,
        o.status,
        o.created_at,

        oi.id AS order_item_id,
        oi.menu_item_id,
        oi.customer_name,
        oi.quantity,
        oi.unit_price,
        oi.observation,

        mi.name AS menu_item_name

      FROM orders o

      LEFT JOIN order_items oi
        ON oi.order_id = o.id

      LEFT JOIN menu_items mi
        ON mi.id = oi.menu_item_id

      WHERE o.account_id = ?

      ORDER BY
        o.created_at ASC,
        oi.id ASC
      `,
      [account.id],
    );

    const ordersMap = new Map<number, any>();

    for (const row of orderRows as any[]) {
      const orderId = Number(row.id);

      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: orderId,
          status: row.status,
          created_at: row.created_at,
          items: [],
        });
      }

      if (row.order_item_id) {
        ordersMap.get(orderId).items.push({
          id: Number(row.order_item_id),
          menu_item_id: Number(row.menu_item_id),
          customer_name: row.customer_name,
          quantity: Number(row.quantity),
          unit_price: Number(row.unit_price),
          observation: row.observation,
          name: row.menu_item_name,
        });
      }
    }

    const orders = Array.from(ordersMap.values());

    return NextResponse.json({
      categories,
      orders,
    });
  } catch (error) {
    console.error("Erro ao carregar dados dos pedidos:", error);

    return NextResponse.json(
      {
        error: "Erro interno ao carregar pedidos.",
      },
      { status: 500 },
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const connection = await pool.getConnection();

  try {
    const { id: restaurantId } = await params;

    const body = await req.json();

    const { tableId, items } = body;

    if (!restaurantId) {
      return NextResponse.json(
        {
          error: "restaurantId é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (!tableId) {
      return NextResponse.json(
        {
          error: "tableId é obrigatório.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "O pedido precisa possuir pelo menos um item.",
        },
        { status: 400 },
      );
    }
    const employeeSession = await getEmployeeSession("garcom");

    if (!employeeSession) {
      return NextResponse.json(
        {
          error: "Sessão do garçom não encontrada. Informe o PIN novamente.",
        },
        { status: 401 },
      );
    }

    if (employeeSession.restaurantId !== Number(restaurantId)) {
      return NextResponse.json(
        {
          error: "O garçom não pertence a este restaurante.",
        },
        { status: 403 },
      );
    }

    const waiterEmployeeId = employeeSession.employeeId;
    await connection.beginTransaction();

    const [tableRows] = await connection.query(
      `
  SELECT
    id,
    number
  FROM tables
  WHERE id = ?
    AND restaurant_id = ?
  LIMIT 1
  `,
      [tableId, restaurantId],
    );

    const table = (tableRows as any[])[0];

    if (!table) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Mesa não encontrada.",
        },
        { status: 404 },
      );
    }

    const [employeeRows] = await connection.query(
      `
      SELECT
        id
      FROM employees
      WHERE id = ?
        AND restaurant_id = ?
        AND status = 'ativo'
      LIMIT 1
      `,
      [waiterEmployeeId, restaurantId],
    );

    const employee = (employeeRows as any[])[0];

    if (!employee) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Garçom inválido ou inativo.",
        },
        { status: 400 },
      );
    }

    const [accountRows] = await connection.query(
      `
      SELECT
        id,
        total_consumed
      FROM table_accounts
      WHERE table_id = ?
        AND status = 'aberta'
      ORDER BY opened_at DESC
      LIMIT 1
      FOR UPDATE
      `,
      [tableId],
    );

    const account = (accountRows as any[])[0];

    if (!account) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: "Não existe uma conta aberta para esta mesa.",
        },
        { status: 400 },
      );
    }

    const [orderResult] = await connection.query(
      `
      INSERT INTO orders (
        account_id,
        waiter_employee_id
      )
      VALUES (?, ?)
      `,
      [account.id, waiterEmployeeId],
    );

    const orderId = (orderResult as any).insertId;

    let orderTotal = 0;

    for (const item of items) {
      const menuItemId = Number(item.menuItemId);
      const quantity = Number(item.quantity);

      const customerName = String(item.customerName || "").trim();

      const observation = String(item.observation || "").trim() || null;

      if (!menuItemId) {
        throw new Error("Produto inválido.");
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("Quantidade inválida.");
      }

      if (!customerName) {
        throw new Error("O nome do cliente é obrigatório.");
      }

      const [menuItemRows] = await connection.query(
        `
       SELECT
  mi.id,
  mi.name,
  mi.price,
  mi.available
FROM menu_items mi

        INNER JOIN menu_categories mc
          ON mc.id = mi.category_id

        WHERE mi.id = ?
          AND mc.restaurant_id = ?

        LIMIT 1
        `,
        [menuItemId, restaurantId],
      );

      const menuItem = (menuItemRows as any[])[0];

      if (!menuItem) {
        throw new Error(`Produto ${menuItemId} não encontrado.`);
      }

      if (!Boolean(menuItem.available)) {
        throw new Error(`O produto ${menuItemId} está indisponível.`);
      }

      const unitPrice = Number(menuItem.price);

      const itemTotal = quantity * unitPrice;

      orderTotal += itemTotal;

      await connection.query(
        `
        INSERT INTO order_items (
          order_id,
          menu_item_id,
          customer_name,
          quantity,
          unit_price,
          observation
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [orderId, menuItemId, customerName, quantity, unitPrice, observation],
      );

      await createEmployeeLog(
        connection,
        restaurantId,
        waiterEmployeeId,
        `Fez pedido para a mesa ${table.number}: ${quantity}x ${menuItem.name}${customerName ? ` para ${customerName}` : ""}${observation ? ` (obs: ${observation})` : ""}.`,
      );
    }

    await connection.query(
      `
      UPDATE table_accounts
      SET total_consumed = total_consumed + ?
      WHERE id = ?
      `,
      [orderTotal, account.id],
    );

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        orderId,
        accountId: account.id,
        orderTotal,
      },
      { status: 201 },
    );
  } catch (error) {
    await connection.rollback();

    console.error("Erro ao criar pedido:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao criar pedido.",
      },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
