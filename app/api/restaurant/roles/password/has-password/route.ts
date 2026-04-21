import { db } from "../../../../../lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const restaurantId = searchParams.get("restaurantId");


  const [rows]: any = await db.query(
    `
    SELECT COUNT(*) as total
    FROM roles
    WHERE restaurant_id = ?
    AND password IS NOT NULL
    `,
    [restaurantId]
  );

  const total = rows[0]?.total || 0;

  return NextResponse.json({
    hasPassword: total > 0,
  });
}
