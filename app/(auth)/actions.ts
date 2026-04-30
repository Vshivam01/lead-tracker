"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safe-redirect";
import { authSchema } from "@/lib/validation/auth";

export type AuthState = { error: string } | undefined;

function readNext(formData: FormData): string {
  const raw = formData.get("next");
  return safeNextPath(typeof raw === "string" ? raw : null) ?? "/leads";
}

function parseCredentials(formData: FormData) {
  return authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    console.error("[login] Supabase error:", error);
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login credentials")) {
      return { error: "Wrong email or password." };
    }
    if (msg.includes("email not confirmed")) {
      return { error: "Please confirm your email before logging in." };
    }
    return { error: "Something went wrong. Please try again." };
  }
  redirect(readNext(formData));
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = parseCredentials(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) {
    console.error("[signup] Supabase error:", error);
    const msg = error.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("user already")) {
      return { error: "An account with that email already exists." };
    }
    if (msg.includes("password")) {
      return { error: "Password is too weak. Try a longer one." };
    }
    return { error: "Something went wrong. Please try again." };
  }
  redirect(readNext(formData));
}