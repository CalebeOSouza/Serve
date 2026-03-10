import { db } from "../../../lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ matrices: [] });

  const [rows]: any = await db.query(
    "SELECT id, name, description, city, status FROM restaurants WHERE user_id=? AND type='matriz'",
    [session.user.id]
  );

  return NextResponse.json({ matrices: rows });
}
