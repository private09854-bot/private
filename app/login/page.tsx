import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return <LoginForm />;
}
