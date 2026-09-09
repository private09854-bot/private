import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "vault_session";

export type SessionUser = NonNullable<
  Awaited<ReturnType<typeof getSessionUser>>
>;

/** Read the logged-in user from the session cookie, or null if signed out. */
export async function getSessionUser() {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

/** Require any authenticated user; redirect to /login otherwise. */
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

/** Require an ADMIN user; redirect non-admins away from the admin console. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/dashboard");
  return user;
}

/** Require a CUSTOMER user; bounce admins into the admin console. */
export async function requireCustomer() {
  const user = await requireUser();
  if (user.role === "ADMIN") redirect("/admin");
  return user;
}
