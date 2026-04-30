import { AuthForm } from "@/components/auth/auth-form";
import { safeNextPath } from "@/lib/safe-redirect";
import { login } from "../actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="login" next={safeNextPath(next) ?? "/leads"} action={login} />;
}