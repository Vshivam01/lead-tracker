"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthState } from "@/app/(auth)/actions";

type Props = {
  mode: "login" | "signup";
  next: string;
  action: (prev: AuthState, formData: FormData) => Promise<AuthState>;
};

const COPY = {
  login: {
    title: "Welcome back",
    description: "Log in to manage your leads.",
    submit: "Log in",
    pending: "Logging in...",
    altPrompt: "Don't have an account?",
    altLabel: "Sign up",
    altHref: "/signup",
    autoComplete: "current-password",
  },
  signup: {
    title: "Create your account",
    description: "Start tracking leads from your CSV exports.",
    submit: "Sign up",
    pending: "Creating account...",
    altPrompt: "Already have an account?",
    altLabel: "Log in",
    altHref: "/login",
    autoComplete: "new-password",
  },
} as const;

export function AuthForm({ mode, next, action }: Props) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    undefined,
  );
  const copy = COPY[mode];
  const altHref =
    next === "/leads" ? copy.altHref : `${copy.altHref}?next=${encodeURIComponent(next)}`;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">{copy.title}</CardTitle>
        <CardDescription>{copy.description}</CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete={copy.autoComplete}
              required
              minLength={8}
              disabled={pending}
            />
          </div>
          {state?.error ? (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? copy.pending : copy.submit}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            {copy.altPrompt}{" "}
            <Link
              href={altHref}
              className="hover:text-foreground underline underline-offset-4"
            >
              {copy.altLabel}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}