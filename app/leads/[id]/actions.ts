"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LEAD_STATUSES } from "@/lib/leads/constants";
import { createClient } from "@/lib/supabase/server";

const emptyToNull = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? null : v;

const updateSchema = z.object({
  id: z.string().uuid("Invalid lead id."),
  status: z.enum(LEAD_STATUSES),
  notes: z.preprocess(emptyToNull, z.string().max(5000).nullable()),
  next_follow_up_at: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD")
      .nullable(),
  ),
});

export type UpdateLeadResult = { ok: true } | { ok: false; error: string };

export async function updateLead(
  _prev: UpdateLeadResult | undefined,
  formData: FormData,
): Promise<UpdateLeadResult> {
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    notes: formData.get("notes"),
    next_follow_up_at: formData.get("next_follow_up_at"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { id, status, notes, next_follow_up_at } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status, notes, next_follow_up_at })
    .eq("id", id);

  if (error) {
    console.error("[updateLead] failed:", error);
    return { ok: false, error: "Couldn't save changes. Please try again." };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/");

  return { ok: true };
}
