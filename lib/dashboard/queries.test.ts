import { describe, expect, it } from "vitest";
import { computeConversionRate, type StatusCounts } from "./queries";

const counts = (overrides: Partial<StatusCounts>): StatusCounts => ({
  not_called: 0,
  voicemail: 0,
  interested: 0,
  not_interested: 0,
  sold: 0,
  ...overrides,
});

describe("computeConversionRate", () => {
  it("returns null when no leads have been contacted", () => {
    expect(computeConversionRate(counts({}))).toBeNull();
    expect(computeConversionRate(counts({ not_called: 50 }))).toBeNull();
  });

  it("returns 100 when every contacted lead is sold", () => {
    expect(computeConversionRate(counts({ sold: 5 }))).toBe(100);
  });

  it("returns 0 when no contacted leads were sold", () => {
    expect(
      computeConversionRate(
        counts({ voicemail: 3, interested: 2, not_interested: 5 }),
      ),
    ).toBe(0);
  });

  it("computes the percentage among contacted leads only", () => {
    // 10 sold, 30 contacted total → 33.33...% — but the denominator
    // intentionally excludes not_called, so adding 100 untouched leads
    // does not change the answer.
    const rate = computeConversionRate(
      counts({
        sold: 10,
        interested: 10,
        voicemail: 5,
        not_interested: 5,
        not_called: 100,
      }),
    );
    expect(rate).not.toBeNull();
    expect(rate).toBeCloseTo(33.333, 2);
  });

  it("rounds cleanly to one decimal when the consumer formats with toFixed(1)", () => {
    // The function returns a raw number; the dashboard renders with
    // .toFixed(1). Verify the integration produces "33.3", not "33.333".
    const rate = computeConversionRate(counts({ sold: 1, interested: 2 }));
    expect(rate?.toFixed(1)).toBe("33.3");
  });

  it("handles a single contacted, single sold lead → 100%", () => {
    expect(computeConversionRate(counts({ sold: 1 }))).toBe(100);
  });
});
