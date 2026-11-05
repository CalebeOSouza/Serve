import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getEmployeeSession } from "@/app/lib/employeeSession";
import { db } from "@/app/lib/db";

type EmployeeRole = "gerente" | "cozinha" | "caixa" | "garcom";

const EMPLOYEE_ROLES: EmployeeRole[] = [
  "gerente",
  "cozinha",
  "caixa",
  "garcom",
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = Number(searchParams.get("restaurantId"));

    if (
      !Number.isInteger(restaurantId) ||
      restaurantId <= 0
    ) {
      return NextResponse.json(
        { error: "restaurantId inválido." },
        { status: 400 }
      );
    }

   
    const session = await getServerSession(authOptions);

    let authorized = Boolean(session?.user?.email);

  
    if (!authorized) {
      for (const role of EMPLOYEE_ROLES) {
        const employeeSession = await getEmployeeSession(role);

        if (
          employeeSession &&
          employeeSession.restaurantId === restaurantId
        ) {
          authorized = true;
          break;
        }
      }
    }

    if (!authorized) {
      return NextResponse.json(
        { error: "Não autorizado." },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const [restaurants]: any = await db.execute(
      `
        SELECT id, name, description, city, state
        FROM restaurants
        WHERE id = ?
        LIMIT 1
      `,
      [restaurantId]
    );

    if (!restaurants.length) {
      return NextResponse.json(
        { error: "Restaurante não encontrado." },
        { status: 404 }
      );
    }

    const restaurant = restaurants[0];

    const [mediaRows]: any = await db.execute(
      `
        SELECT logo_url, banner_url
        FROM restaurant_media
        WHERE restaurant_id = ?
        LIMIT 1
      `,
      [restaurant.id]
    );

    const [hoursRows]: any = await db.execute(
      `
        SELECT day_of_week, enabled, open_time, close_time
        FROM restaurant_hours
        WHERE restaurant_id = ?
        ORDER BY FIELD(
          day_of_week,
          'segunda','terca','quarta','quinta','sexta','sabado','domingo'
        )
      `,
      [restaurant.id]
    );

    return NextResponse.json(
      {
        ...restaurant,
        media: mediaRows[0] ?? {
          logo_url: null,
          banner_url: null,
        },
        hours: hoursRows,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Erro ao buscar restaurante:", err);

    return NextResponse.json(
      { error: "Erro ao buscar restaurante." },
      { status: 500 }
    );
  }
}