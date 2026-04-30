import Papa from "papaparse";
import { parsedLeadRowSchema, type ParsedLeadRow } from "./schema";

export type ParseError = { row: number; message: string };
export type ParseResult = { rows: ParsedLeadRow[]; errors: ParseError[] };

/**
 * Parse a lead-finder CSV string into validated rows + per-row errors.
 *
 * - Strips a leading BOM (Excel/Windows exports sometimes prepend U+FEFF).
 * - Returns empty arrays for empty input or header-only CSVs (no throw).
 * - Row numbers are 1-indexed and *include the header line*, so they match
 *   what the user sees in their spreadsheet ("Row 5" = line 5).
 * - Unknown columns are silently ignored (Zod object strips by default).
 *
 * Known limitation: blank lines mixed into the data shift subsequent row
 * numbers. lead-finder doesn't emit blank rows, so this is acceptable for
 * the MVP.
 */
export function parseLeadsCsv(csv: string): ParseResult {
  // U+FEFF — the byte-order mark Excel/Windows tools sometimes prepend.
  const stripped = csv.replace(/^﻿/, "");
  if (stripped.trim() === "") return { rows: [], errors: [] };

  const parsed = Papa.parse<Record<string, string>>(stripped, {
    header: true,
    skipEmptyLines: true,
  });

  const rows: ParsedLeadRow[] = [];
  const errors: ParseError[] = [];

  parsed.data.forEach((raw, i) => {
    // i=0 is the first data row, which is line 2 in the user's spreadsheet
    // (line 1 = header).
    const rowNumber = i + 2;
    const result = parsedLeadRowSchema.safeParse(raw);
    if (result.success) {
      rows.push(result.data);
    } else {
      const message = result.error.issues
        .map((iss) => {
          const path = iss.path.join(".") || "row";
          return `${path}: ${iss.message}`;
        })
        .join("; ");
      errors.push({ row: rowNumber, message });
    }
  });

  return { rows, errors };
}
