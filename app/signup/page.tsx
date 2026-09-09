import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import SignupForm from "./signup-form";

export default async function SignupPage() {
  const user = await getSessionUser();
  if (user) redirect(user.role === "ADMIN" ? "/admin" : "/dashboard");
  return <SignupForm />;
}
