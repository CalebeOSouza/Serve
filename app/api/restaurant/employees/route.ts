import { db } from "../../../lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.accountType !== "user") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { name, roles, cpf, restaurantId } = body;

    if (!name || !roles || !cpf || roles.length === 0) {
      return NextResponse.json(
        { error: "Nome, CPF e cargos são obrigatórios" },
        { status: 400 },
      );
    }

    const [rolesWithPassword]: any = await db.query(
      `SELECT id FROM roles
   WHERE restaurant_id = ?
   AND password IS NOT NULL
   LIMIT 1`,
      [restaurantId],
    );

    if (rolesWithPassword.length === 0) {
      return NextResponse.json(
        {
          error:
            "Defina a senha dos cargos antes de cadastrar funcionários.",
        },
        { status: 400 },
      );
    }

    const [existingEmployees]: any = await db.query(
      `SELECT id, name FROM employees WHERE cpf = ? AND restaurant_id = ?`,
      [cpf, restaurantId],
    );

    if (existingEmployees.length > 0) {
      const existingName = existingEmployees[0].name;

      if (existingName.toLowerCase() !== name.toLowerCase()) {
        return NextResponse.json(
          {
            error: `O CPF ${cpf} já pertence a "${existingName}". Use o nome correto.`,
          },
          { status: 400 },
        );
      }
    }

    if (roles.includes("gerente")) {
      const [existingManager]: any = await db.query(
        `
      SELECT er.employee_id 
      FROM employee_roles er
      JOIN roles r ON r.id = er.role_id
      WHERE r.type = 'gerente' AND r.restaurant_id = ?
      LIMIT 1
    `,
        [restaurantId],
      );

      if (existingManager.length > 0) {
        return NextResponse.json(
          { error: "Já existe um gerente cadastrado neste restaurante." },
          { status: 400 },
        );
      }
    }

    const [dbRoles]: any = await db.query(
      `SELECT id, type FROM roles WHERE restaurant_id = ?`,
      [restaurantId],
    );

    let employeeId: number;

    if (existingEmployees.length > 0) {
      employeeId = existingEmployees[0].id;
    } else {
      const [result]: any = await db.query(
        `INSERT INTO employees (name, cpf, restaurant_id)
VALUES (?, ?, ?)`,
        [name, cpf, restaurantId],
      );
      employeeId = result.insertId;
    }

    const createdEntries = [];

    const [existingRolesDb]: any = await db.query(
      `
  SELECT r.type
  FROM employee_roles er
  JOIN roles r ON r.id = er.role_id
  WHERE er.employee_id = ?
  `,
      [employeeId],
    );

    const existingRoles = existingRolesDb.map((r: any) => r.type.toLowerCase());

    for (const roleType of roles) {
      if (existingRoles.includes(roleType.toLowerCase())) {
        return NextResponse.json(
          {
            error: `Este funcionário já possui o cargo "${roleType}".`,
          },
          { status: 400 },
        );
      }
    }

    for (const roleType of roles) {
      const roleObj = dbRoles.find((r: any) => r.type === roleType);

      if (roleObj) {
        await db.query(
          `INSERT IGNORE INTO employee_roles (employee_id, role_id) VALUES (?, ?)`,
          [employeeId, roleObj.id],
        );
        createdEntries.push({ employeeId, roleId: roleObj.id, type: roleType });
      }
    }

    revalidatePath("/funcionarios");
    return NextResponse.json({
      message: "Cargos vinculados com sucesso",
      data: createdEntries,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.accountType !== "user") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId é obrigatório" },
        { status: 400 },
      );
    }

    const [employees]: any = await db.query(
      `
  SELECT 
    e.id AS employee_id,
    e.name,
    e.pin,
    e.cpf,
    e.status,
    e.created_at,
    GROUP_CONCAT(r.type) AS roles
  FROM employees e
  JOIN employee_roles er ON er.employee_id = e.id
  JOIN roles r ON r.id = er.role_id
  WHERE e.restaurant_id = ?
  GROUP BY e.id
  ORDER BY e.created_at DESC
  `,
      [restaurantId],
    );

    const formatted = employees.map((e: any) => ({
      id: e.employee_id,
      name: e.name,
      cpf: e.cpf,
      pin: e.pin,
      status: e.status,
      created_at: e.created_at,
      roles: e.roles.split(","),
    }));

    return NextResponse.json({ employees: formatted });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Erro ao buscar funcionários" },
      { status: 500 },
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.accountType !== "user") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { employeeId, name, roles, cpf, restaurantId } = body;

    if (!employeeId || !name || !roles || !cpf || roles.length === 0) {
      return NextResponse.json(
        { error: "Dados obrigatórios faltando" },
        { status: 400 },
      );
    }

    const [existingEmployees]: any = await db.query(
      `SELECT id, name FROM employees WHERE cpf = ? AND restaurant_id = ?`,
      [cpf, restaurantId],
    );

    if (existingEmployees.length > 0) {
      const existing = existingEmployees[0];

      if (existing.id !== employeeId) {
        return NextResponse.json(
          {
            error: `O CPF ${cpf} já pertence a "${existing.name}".`,
          },
          { status: 400 },
        );
      }
    }

    if (roles.includes("gerente")) {
      const [existingManager]: any = await db.query(
        `
        SELECT er.employee_id 
        FROM employee_roles er
        JOIN roles r ON r.id = er.role_id
        WHERE r.type = 'gerente' 
        AND r.restaurant_id = ?
        AND er.employee_id != ?
        LIMIT 1
        `,
        [restaurantId, employeeId],
      );

      if (existingManager.length > 0) {
        return NextResponse.json(
          { error: "Já existe um gerente cadastrado neste restaurante." },
          { status: 400 },
        );
      }
    }

    const [rolesWithPassword]: any = await db.query(
      `SELECT id FROM roles
   WHERE restaurant_id = ?
   AND password IS NOT NULL
   LIMIT 1`,
      [restaurantId],
    );

    if (rolesWithPassword.length === 0) {
      return NextResponse.json(
        {
          error:
            "Defina a senha dos cargos antes de cadastrar funcionários.",
        },
        { status: 400 },
      );
    }

    await db.query(`UPDATE employees SET name = ?, cpf = ? WHERE id = ?`, [
      name,
      cpf,
      employeeId,
    ]);

    const [dbRoles]: any = await db.query(
      `SELECT id, type FROM roles WHERE restaurant_id = ?`,
      [restaurantId],
    );

    await db.query(`DELETE FROM employee_roles WHERE employee_id = ?`, [
      employeeId,
    ]);

    const createdEntries = [];

    for (const roleType of roles) {
      const roleObj = dbRoles.find((r: any) => r.type === roleType);

      if (roleObj) {
        await db.query(
          `INSERT INTO employee_roles (employee_id, role_id) VALUES (?, ?)`,
          [employeeId, roleObj.id],
        );

        createdEntries.push({
          employeeId,
          roleId: roleObj.id,
          type: roleType,
        });
      }
    }

    revalidatePath("/funcionarios");

    return NextResponse.json({
      message: "Funcionário atualizado com sucesso",
      data: createdEntries,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.accountType !== "user") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "employeeId é obrigatório" },
        { status: 400 },
      );
    }

    await db.query(`DELETE FROM employee_roles WHERE employee_id = ?`, [
      employeeId,
    ]);

    await db.query(`DELETE FROM employees WHERE id = ?`, [employeeId]);

    revalidatePath("/funcionarios");

    return NextResponse.json({
      message: "Funcionário excluído com sucesso",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
