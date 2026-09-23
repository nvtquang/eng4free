import { auth } from "@/auth";
import { headers } from "next/headers";

export function isBootstrapAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return admins.includes(email.toLowerCase());
}

export async function getAdminActor() {
  const testToken = process.env.E4F_E2E_ADMIN_TOKEN;
  if (testToken && (await headers()).get("x-e4f-admin-token") === testToken) return { email: "e2e-admin@local.test", isAdmin: true };
  const session = await auth();
  return { email: session?.user?.email ?? null, isAdmin: isBootstrapAdmin(session?.user?.email) };
}
