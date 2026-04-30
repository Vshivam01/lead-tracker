import { z } from "zod";

/**
 * Validation schema for a single row from a lead-finder CSV.
 *
 * CSV cells arrive as strings (papaparse never coerces). Two helpers below
 * handle the conversion to the right shapes before Zod validates:
 *   - emptyToUndef:     "" / "   " → undefined, so .optional() works as expected.
 *   - numericFromString: "4.5" → 4.5 ; "" → undefined ; "abc" → "abc" (Zod fails).
 */

const emptyToUndef = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const numericFromString = (v: unknown) => {
  if (typeof v !== "string") return v;
  const trimmed = v.trim();
  if (trimmed === "") return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : v;
};

const isUrl = (v: string) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

export const parsedLeadRowSchema = z.object({
  business_name: z.string().trim().min(1, "business_name is required"),
  category: z.preprocess(emptyToUndef, z.string().optional()),
  city: z.preprocess(emptyToUndef, z.string().optional()),
  address: z.preprocess(emptyToUndef, z.string().optional()),
  phone: z.preprocess(emptyToUndef, z.string().optional()),
  google_maps_url: z.preprocess(
    emptyToUndef,
    z
      .string()
      .refine(isUrl, { message: "google_maps_url must be a valid URL" })
      .optional(),
  ),
  rating: z.preprocess(
    numericFromString,
    z.number().min(0).max(5).optional(),
  ),
  total_reviews: z.preprocess(
    numericFromString,
    z.number().int().min(0).optional(),
  ),
  hours_today: z.preprocess(emptyToUndef, z.string().optional()),
  place_id: z.string().trim().min(1, "place_id is required"),
});

export type ParsedLeadRow = z.infer<typeof parsedLeadRowSchema>;
