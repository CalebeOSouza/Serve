import { db } from "../../../../../lib/db";
import { NextRequest, NextResponse } from "next/server";
import { getEmployeeSession } from "../../../../../lib/employeeSession";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: restaurantId } = await params;

  try {
    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: "ID da reserva não informado." },
        { status: 400 },
      );
    }

    const connection = await db.getConnection();

    const [reservationRows]: any = await connection.query(
      `
    SELECT
      r.customer_name,
      r.people_count,
      r.reservation_date,
      r.reservation_time,
      t.number AS table_number
    FROM reservations r
    INNER JOIN tables t
      ON t.id = r.table_id
    WHERE r.id = ?
      AND r.restaurant_id = ?
    LIMIT 1
  `,
      [reservationId, restaurantId],
    );

    try {
      const [result] = await connection.execute(
        `
          DELETE FROM reservations
          WHERE id = ?
            AND restaurant_id = ?
        `,
        [reservationId, restaurantId],
      );

      const affectedRows = (result as any).affectedRows;

      if (affectedRows === 0) {
        return NextResponse.json(
          { error: "Reserva não encontrada." },
          { status: 404 },
        );
      }

      const employeeSession = await getEmployeeSession("garcom");

      if (employeeSession) {
        await createEmployeeLog(
          connection,
          restaurantId,
          employeeSession.employeeId,
          `Excluiu a reserva da mesa ${reservationRows[0].table_number}: ${reservationRows[0].customer_name}, ${reservationRows[0].people_count} pessoa${reservationRows[0].people_count === 1 ? "" : "s"}.`,
        );
      }

      return NextResponse.json({
        success: true,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Erro ao excluir reserva:", error);

    return NextResponse.json(
      { error: "Erro interno ao excluir reserva." },
      { status: 500 },
    );
  }
}
async function createEmployeeLog(
  connection: any,
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
async function syncTableStatuses(connection: any, restaurantId: string) {
  await connection.query(
    `
      UPDATE tables t
      INNER JOIN (
        SELECT
          table_id,
          MIN(TIMESTAMP(reservation_date, reservation_time)) AS reservation_datetime
        FROM reservations
        WHERE restaurant_id = ?
          AND TIMESTAMP(reservation_date, reservation_time) > NOW()
        GROUP BY table_id
      ) r ON r.table_id = t.id
      SET t.status = 'reservada'
      WHERE t.restaurant_id = ?
        AND t.status = 'livre'
        AND r.reservation_datetime <= DATE_ADD(NOW(), INTERVAL 150 MINUTE)
    `,
    [restaurantId, restaurantId],
  );

  await connection.query(
    `
       UPDATE tables t
      INNER JOIN (
        SELECT
          table_id,
          MIN(TIMESTAMP(reservation_date, reservation_time)) AS reservation_datetime
        FROM reservations
        WHERE restaurant_id = ?
          AND TIMESTAMP(reservation_date, reservation_time) <= NOW()
          AND TIMESTAMP(reservation_date, reservation_time) >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
        GROUP BY table_id
      ) r ON r.table_id = t.id
      SET t.status = 'ocupada'
      WHERE t.restaurant_id = ?
        AND t.status = 'reservada'
    `,
    [restaurantId, restaurantId],
  );

  await connection.query(
    `
    INSERT INTO table_accounts (
      table_id,
      status,
      total_consumed,
      total_paid
    )
    SELECT
      t.id,
      'aberta',
      0,
      0
    FROM tables t
    WHERE t.restaurant_id = ?
      AND t.status = 'ocupada'
      AND NOT EXISTS (
        SELECT 1
        FROM table_accounts ta
        WHERE ta.table_id = t.id
          AND ta.status IN ('aberta', 'conta_solicitada')
      )
  `,
    [restaurantId],
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: restaurantId } = await params;

  let connection;

  try {
    connection = await db.getConnection();

    await connection.beginTransaction();

    await syncTableStatuses(connection, restaurantId);
    const [rows]: any = await connection.query(
      `
    SELECT
      r.id,
      r.table_id,
      r.customer_name,
      r.people_count,
      r.reservation_date,
      r.reservation_time,
      t.number AS table_number,
      t.type AS table_type
    FROM reservations r
    INNER JOIN tables t
      ON t.id = r.table_id
    WHERE r.restaurant_id = ?
  AND TIMESTAMP(r.reservation_date, r.reservation_time) > NOW()
ORDER BY r.reservation_date ASC, r.reservation_time ASC
  `,
      [restaurantId],
    );

    const [occupationRows]: any = await connection.query(
      `
    SELECT
      r.id,
      r.table_id,
      r.customer_name AS name,
      r.people_count
    FROM reservations r
    WHERE r.restaurant_id = ?
      AND TIMESTAMP(r.reservation_date, r.reservation_time) <= NOW()
      AND NOT EXISTS (
        SELECT 1
        FROM reservations r2
        WHERE r2.restaurant_id = r.restaurant_id
          AND r2.table_id = r.table_id
          AND TIMESTAMP(r2.reservation_date, r2.reservation_time)
            > TIMESTAMP(r.reservation_date, r.reservation_time)
          AND TIMESTAMP(r2.reservation_date, r2.reservation_time) <= NOW()
      )
  `,
      [restaurantId],
    );

    const [tableRows]: any = await connection.query(
      `
        SELECT
          id,
          status
        FROM tables
        WHERE restaurant_id = ?
      `,
      [restaurantId],
    );

    await connection.commit();

    return NextResponse.json({
      reservations: rows,
      tableCustomers: occupationRows,
      tables: tableRows,
    });
  } catch (error) {
    console.error("Erro ao buscar reservas:", error);

    if (connection) {
      await connection.rollback();
    }

    return NextResponse.json(
      { error: "Erro ao buscar reservas." },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: restaurantId } = await params;

  let connection;

  try {
    const body = await req.json();

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

    const employeeId = employeeSession.employeeId;

    const { action, name, date, time, tableId, peopleCount } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurante não informado." },
        { status: 400 },
      );
    }

    if (!tableId) {
      return NextResponse.json(
        { error: "Mesa não informada." },
        { status: 400 },
      );
    }
    if (!Number.isInteger(Number(peopleCount)) || Number(peopleCount) < 1) {
      return NextResponse.json(
        { error: "A quantidade de pessoas deve ser informada." },
        { status: 400 },
      );
    }
    connection = await db.getConnection();
    await connection.beginTransaction();

    if (action === "occupy") {
      if (!name?.trim()) {
        await connection.rollback();

        return NextResponse.json(
          { error: "Nome do cliente principal é obrigatório." },
          { status: 400 },
        );
      }

      const [tableRows]: any = await connection.query(
        `
    SELECT
      id,
      number,
      status,
      capacity
    FROM tables
    WHERE id = ?
      AND restaurant_id = ?
    FOR UPDATE
  `,
        [tableId, restaurantId],
      );
      if (tableRows.length === 0) {
        await connection.rollback();

        return NextResponse.json(
          { error: "Mesa não encontrada." },
          { status: 404 },
        );
      }

      const table = tableRows[0];

      if (Number(peopleCount) > Number(table.capacity)) {
        await connection.rollback();

        return NextResponse.json(
          {
            error: `Esta mesa comporta no máximo ${table.capacity} pessoas.`,
          },
          { status: 400 },
        );
      }

      if (table.status === "indisponivel") {
        await connection.rollback();

        return NextResponse.json(
          { error: "Esta mesa está indisponível." },
          { status: 400 },
        );
      }

      if (table.status === "reservada") {
        await connection.rollback();

        return NextResponse.json(
          {
            error:
              "Esta mesa possui uma reserva e não pode ser ocupada manualmente.",
          },
          { status: 409 },
        );
      }

      if (table.status === "ocupada") {
        await connection.rollback();

        return NextResponse.json(
          { error: "Esta mesa já está ocupada." },
          { status: 409 },
        );
      }

      const [reservationResult]: any = await connection.query(
        `
         INSERT INTO reservations (
  restaurant_id,
  table_id,
  customer_name,
  people_count,
  reservation_date,
  reservation_time
)
VALUES (?, ?, ?, ?, CURDATE(), CURTIME())
        `,
        [restaurantId, tableId, name.trim(), Number(peopleCount)],
      );

      await connection.query(
        `
          UPDATE tables
          SET status = 'ocupada'
          WHERE id = ?
            AND restaurant_id = ?
        `,
        [tableId, restaurantId],
      );

      await connection.query(
        `
    INSERT INTO table_accounts (
      table_id,
      status,
      total_consumed,
      total_paid
    )
    VALUES (?, 'aberta', 0, 0)
  `,
        [tableId],
      );

      await createEmployeeLog(
        connection,
        restaurantId,
        employeeId,
        `Ocupou a mesa ${table.number} para ${name.trim()}, ${Number(peopleCount)} pessoa${Number(peopleCount) === 1 ? "" : "s"}.`,
      );

      await connection.commit();

      return NextResponse.json(
        {
          success: true,
          message: "Mesa ocupada com sucesso.",
          reservationId: reservationResult.insertId,
        },
        { status: 201 },
      );
    }

    if (!name?.trim()) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Nome do reservante é obrigatório." },
        { status: 400 },
      );
    }

    if (!date) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Data da reserva é obrigatória." },
        { status: 400 },
      );
    }

    if (!time) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Horário da reserva é obrigatório." },
        { status: 400 },
      );
    }

    const [nowCheckRows]: any = await connection.query(
      `SELECT TIMESTAMP(?, ?) > NOW() AS isFuture`,
      [date, time],
    );

    if (!nowCheckRows[0].isFuture) {
      await connection.rollback();

      return NextResponse.json(
        {
          error:
            "A data e o horário da reserva precisam ser no futuro em relação ao momento atual.",
        },
        { status: 400 },
      );
    }

    const [tableRows]: any = await connection.query(
      `
    SELECT
      id,
      number,
      status,
      capacity
    FROM tables
    WHERE id = ?
      AND restaurant_id = ?
    FOR UPDATE
  `,
      [tableId, restaurantId],
    );

    if (tableRows.length === 0) {
      await connection.rollback();

      return NextResponse.json(
        { error: "Mesa não encontrada." },
        { status: 404 },
      );
    }

    const table = tableRows[0];

    if (Number(peopleCount) > Number(table.capacity)) {
      await connection.rollback();

      return NextResponse.json(
        {
          error: `Esta mesa comporta no máximo ${table.capacity} pessoas.`,
        },
        { status: 400 },
      );
    }

    if (table.status === "indisponivel") {
      await connection.rollback();

      return NextResponse.json(
        { error: "Esta mesa está indisponível." },
        { status: 400 },
      );
    }

    const [reservationRows]: any = await connection.query(
      `
        SELECT
          id,
          customer_name,
          reservation_date,
          reservation_time
        FROM reservations
        WHERE restaurant_id = ?
          AND table_id = ?
          AND ABS(
            TIMESTAMPDIFF(
              MINUTE,
              TIMESTAMP(reservation_date, reservation_time),
              TIMESTAMP(?, ?)
            )
          ) < 150
        ORDER BY
          ABS(
            TIMESTAMPDIFF(
              MINUTE,
              TIMESTAMP(reservation_date, reservation_time),
              TIMESTAMP(?, ?)
            )
          ) ASC
        LIMIT 1
      `,
      [restaurantId, tableId, date, time, date, time],
    );

    if (reservationRows.length > 0) {
      const existingReservation = reservationRows[0];

      await connection.rollback();

      return NextResponse.json(
        {
          error:
            "Esta mesa já possui uma reserva ou ocupação próxima desse horário. É necessário respeitar um intervalo mínimo de 2 horas e 30 minutos.",
          existingReservation: {
            date: existingReservation.reservation_date,
            time: existingReservation.reservation_time,
            customerName: existingReservation.customer_name,
          },
        },
        { status: 409 },
      );
    }

    const [reservationResult]: any = await connection.query(
      `
    INSERT INTO reservations (
      restaurant_id,
      table_id,
      customer_name,
      people_count,
      reservation_date,
      reservation_time
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `,
      [restaurantId, tableId, name.trim(), Number(peopleCount), date, time],
    );
    await createEmployeeLog(
      connection,
      restaurantId,
      employeeId,
      `Criou reserva para a mesa ${table.number}: ${name.trim()}, ${Number(peopleCount)} pessoa${Number(peopleCount) === 1 ? "" : "s"}, ${date} às ${time}.`,
    );

    await syncTableStatuses(connection, restaurantId);

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: "Reserva criada com sucesso.",
        reservationId: reservationResult.insertId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erro ao processar reserva/ocupação:", error);

    if (connection) {
      await connection.rollback();
    }

    return NextResponse.json(
      { error: "Erro interno ao processar a operação." },
      { status: 500 },
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
