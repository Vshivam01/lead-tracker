import { describe, expect, it } from "vitest";
import { parseLeadsCsv } from "./parser";

const HEADER =
  "business_name,category,city,address,phone,google_maps_url,rating,total_reviews,hours_today,place_id";

const VALID_ROW =
  "Acme Co,plumbing,Seattle,123 Main,555-1212,https://maps.google.com/?cid=1,4.5,42,9-5,abc";

describe("parseLeadsCsv", () => {
  it("parses a happy-path CSV with three valid rows", () => {
    const csv = [
      HEADER,
      VALID_ROW,
      "Best Plumb,plumbing,Tacoma,1 Pine,555-3434,https://maps.google.com/?cid=2,3.8,17,9-5,def",
      "Sunrise Inc,roofing,Bellevue,9 Oak,555-9090,https://maps.google.com/?cid=3,5,300,8-6,ghi",
    ].join("\n");

    const { rows, errors } = parseLeadsCsv(csv);

    expect(errors).toEqual([]);
    expect(rows).toHaveLength(3);
    expect(rows[0]?.business_name).toBe("Acme Co");
    expect(rows[0]?.place_id).toBe("abc");
    expect(rows[2]?.place_id).toBe("ghi");
  });

  it("returns empty arrays for empty input", () => {
    expect(parseLeadsCsv("")).toEqual({ rows: [], errors: [] });
    expect(parseLeadsCsv("   \n  ")).toEqual({ rows: [], errors: [] });
  });

  it("returns empty arrays when only the header is present", () => {
    expect(parseLeadsCsv(HEADER)).toEqual({ rows: [], errors: [] });
    expect(parseLeadsCsv(`${HEADER}\n`)).toEqual({ rows: [], errors: [] });
  });

  it("flags missing place_id with the spreadsheet row number", () => {
    const csv = [
      HEADER,
      VALID_ROW,
      "No Place,plumbing,Tacoma,,,,,,,",
    ].join("\n");

    const { rows, errors } = parseLeadsCsv(csv);

    expect(rows).toHaveLength(1);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.row).toBe(3);
    expect(errors[0]?.message).toMatch(/place_id/);
  });

  it("flags missing business_name", () => {
    const csv = [HEADER, ",plumbing,,,,,,,,abc"].join("\n");

    const { rows, errors } = parseLeadsCsv(csv);

    expect(rows).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.row).toBe(2);
    expect(errors[0]?.message).toMatch(/business_name/);
  });

  it("flags an invalid google_maps_url", () => {
    const csv = [HEADER, "Acme,plumbing,,,,not-a-url,,,,abc"].join("\n");

    const { rows, errors } = parseLeadsCsv(csv);

    expect(rows).toEqual([]);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toMatch(/google_maps_url/);
  });

  it("coerces rating from string to number", () => {
    const csv = [HEADER, VALID_ROW].join("\n");
    const { rows } = parseLeadsCsv(csv);
    expect(rows[0]?.rating).toBe(4.5);
    expect(typeof rows[0]?.rating).toBe("number");
  });

  it("coerces total_reviews from string to integer", () => {
    const csv = [HEADER, VALID_ROW].join("\n");
    const { rows } = parseLeadsCsv(csv);
    expect(rows[0]?.total_reviews).toBe(42);
    expect(Number.isInteger(rows[0]?.total_reviews)).toBe(true);
  });

  it("rejects out-of-range rating", () => {
    const csv = [HEADER, "Acme,,,,,,7,,,abc"].join("\n");
    const { rows, errors } = parseLeadsCsv(csv);
    expect(rows).toEqual([]);
    expect(errors[0]?.message).toMatch(/rating/);
  });

  it("rejects non-integer total_reviews", () => {
    const csv = [HEADER, "Acme,,,,,,,3.7,,abc"].join("\n");
    const { rows, errors } = parseLeadsCsv(csv);
    expect(rows).toEqual([]);
    expect(errors[0]?.message).toMatch(/total_reviews/);
  });

  it("preserves quoted fields containing commas", () => {
    const csv = [
      HEADER,
      `"Smith, Jones & Co.",legal,,,,,,,,xyz`,
    ].join("\n");

    const { rows, errors } = parseLeadsCsv(csv);

    expect(errors).toEqual([]);
    expect(rows[0]?.business_name).toBe("Smith, Jones & Co.");
  });

  it("strips a leading BOM and parses normally", () => {
    const csv = `﻿${HEADER}\n${VALID_ROW}`;
    const { rows, errors } = parseLeadsCsv(csv);

    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.business_name).toBe("Acme Co");
  });

  it("partitions mixed valid and invalid rows", () => {
    const csv = [
      HEADER,
      VALID_ROW,
      "No Place,plumbing,,,,,,,,", // row 3 — missing place_id
      "Sunrise Inc,roofing,Bellevue,9 Oak,555-9090,https://maps.google.com/?cid=3,5,300,8-6,ghi",
    ].join("\n");

    const { rows, errors } = parseLeadsCsv(csv);

    expect(rows).toHaveLength(2);
    expect(errors).toHaveLength(1);
    expect(errors[0]?.row).toBe(3);
    expect(rows.map((r) => r.place_id)).toEqual(["abc", "ghi"]);
  });

  it("ignores unknown extra columns", () => {
    const csv = [
      `${HEADER},status,notes`,
      `${VALID_ROW},not_called,initial outreach`,
    ].join("\n");

    const { rows, errors } = parseLeadsCsv(csv);

    expect(errors).toEqual([]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.business_name).toBe("Acme Co");
    // Unknown keys are stripped — they don't appear on the parsed object.
    expect(rows[0]).not.toHaveProperty("status");
    expect(rows[0]).not.toHaveProperty("notes");
  });
});
