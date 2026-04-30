import { AuthForm } from "@/components/auth/auth-form";
import { safeNextPath } from "@/lib/safe-redirect";
import { signup } from "../actions";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return <AuthForm mode="signup" next={safeNextPath(next) ?? "/leads"} action={signup} />;
}
