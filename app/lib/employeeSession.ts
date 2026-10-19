import { cookies } from "next/headers";
import crypto from "crypto";

type EmployeeRole = "gerente" | "cozinha" | "caixa" | "garcom";

function getSecret() {
  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    throw new Error("NEXTAUTH_SECRET não configurado.");
  }

  return secret;
}

export async function getEmployeeSession(
  requestedRole: EmployeeRole
) {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "serve_employee_session"
  )?.value;

  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 5) {
    return null;
  }

  const [
    employeeId,
    restaurantId,
    role,
    expiresAt,
    signature,
  ] = parts;

  if (
    !employeeId ||
    !restaurantId ||
    !role ||
    !expiresAt ||
    !signature
  ) {
    return null;
  }

  if (role !== requestedRole) {
    return null;
  }

  if (Number(expiresAt) < Date.now()) {
    return null;
  }

  const payload = `${employeeId}.${restaurantId}.${role}.${expiresAt}`;

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const valid =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

  if (!valid) {
    return null;
  }

  const newExpiresAt =
    Date.now() + 12 * 60 * 60 * 1000;

  const newPayload =
    `${employeeId}.${restaurantId}.${role}.${newExpiresAt}`;

  const newSignature = crypto
    .createHmac("sha256", getSecret())
    .update(newPayload)
    .digest("hex");

  const newToken =
    `${newPayload}.${newSignature}`;

  cookieStore.set(
    "serve_employee_session",
    newToken,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 12,
      path: "/",
    }
  );

  return {
    employeeId: Number(employeeId),
    restaurantId: Number(restaurantId),
    role: role as EmployeeRole,
  };
}