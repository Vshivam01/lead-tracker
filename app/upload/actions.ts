"use server";

import { revalidatePath } from "next/cache";
import { parseLeadsCsv, type ParseError } from "@/lib/leads/parser";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 5 * 1024 * 1024;

export type UploadResult =
  | {
      status: "ok";
      inserted: number;
      updated: number;
      parseErrors: ParseError[];
    }
  | { status: "error"; message: string };

export async function uploadLeads(
  _prev: UploadResult | undefined,
  formData: FormData,
): Promise<UploadResult> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Please choose a CSV file." };
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { status: "error", message: "Only .csv files are supported." };
  }
  if (file.size > MAX_BYTES) {
    return { status: "error", message: "File is too large (max 5 MB)." };
  }

  const text = await file.text();
  const { rows, errors: parseErrors } = parseLeadsCsv(text);

  if (rows.length === 0) {
    return { status: "ok", inserted: 0, updated: 0, parseErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { status: "error", message: "Your session has expired. Please log in again." };
  }

  // Pre-fetch existing place_ids so we can report inserts vs updates after
  // the upsert. RLS scopes the SELECT to this user automatically.
  const placeIds = rows.map((r) => r.place_id);
  const { data: existing, error: lookupError } = await supabase
    .from("leads")
    .select("place_id")
    .in("place_id", placeIds);

  if (lookupError) {
    console.error("[upload] lookup failed:", lookupError);
    return { status: "error", message: "Database error. Please try again." };
  }

  const existingSet = new Set((existing ?? []).map((r) => r.place_id));
  const updated = rows.filter((r) => existingSet.has(r.place_id)).length;
  const inserted = rows.length - updated;

  const payload = rows.map((r) => ({
    user_id: user.id,
    business_name: r.business_name,
    place_id: r.place_id,
    category: r.category ?? null,
    city: r.city ?? null,
    address: r.address ?? null,
    phone: r.phone ?? null,
    google_maps_url: r.google_maps_url ?? null,
    rating: r.rating ?? null,
    total_reviews: r.total_reviews ?? null,
    hours_today: r.hours_today ?? null,
  }));

  const { error: upsertError } = await supabase
    .from("leads")
    .upsert(payload, { onConflict: "user_id,place_id" });

  if (upsertError) {
    console.error("[upload] upsert failed:", upsertError);
    return { status: "error", message: "Failed to save leads. Please try again." };
  }

  // Bust the SC cache for pages that read the leads table.
  revalidatePath("/leads");
  revalidatePath("/");

  return { status: "ok", inserted, updated, parseErrors };
}
