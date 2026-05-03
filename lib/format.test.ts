import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { relativeTimeFromNow } from "./format";

const NOW = new Date("2026-05-01T12:00:00Z");

describe("relativeTimeFromNow", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("returns the em-dash placeholder for null/undefined/empty", () => {
    expect(relativeTimeFromNow(null)).toBe("—");
    expect(relativeTimeFromNow(undefined)).toBe("—");
    expect(relativeTimeFromNow("")).toBe("—");
  });

  it("returns 'just now' for sub-minute differences", () => {
    expect(relativeTimeFromNow("2026-05-01T11:59:30Z")).toBe("just now");
    expect(relativeTimeFromNow("2026-05-01T12:00:00Z")).toBe("just now");
  });

  it("formats minute-scale differences", () => {
    expect(relativeTimeFromNow("2026-05-01T11:59:00Z")).toBe("1m ago");
    expect(relativeTimeFromNow("2026-05-01T11:55:00Z")).toBe("5m ago");
    expect(relativeTimeFromNow("2026-05-01T11:01:00Z")).toBe("59m ago");
  });

  it("formats hour-scale differences", () => {
    expect(relativeTimeFromNow("2026-05-01T11:00:00Z")).toBe("1h ago");
    expect(relativeTimeFromNow("2026-05-01T08:00:00Z")).toBe("4h ago");
    expect(relativeTimeFromNow("2026-04-30T13:00:00Z")).toBe("23h ago");
  });

  it("formats day-scale differences (yesterday and beyond)", () => {
    expect(relativeTimeFromNow("2026-04-30T12:00:00Z")).toBe("1d ago");
    expect(relativeTimeFromNow("2026-04-24T12:00:00Z")).toBe("7d ago");
    expect(relativeTimeFromNow("2026-04-04T12:00:00Z")).toBe("27d ago");
  });

  it("rolls into months at 30-day chunks", () => {
    expect(relativeTimeFromNow("2026-04-01T12:00:00Z")).toBe("1mo ago");
    expect(relativeTimeFromNow("2025-11-01T12:00:00Z")).toBe("6mo ago");
  });

  it("rolls into years at 365-day chunks", () => {
    expect(relativeTimeFromNow("2025-05-01T12:00:00Z")).toBe("1y ago");
    expect(relativeTimeFromNow("2024-05-01T12:00:00Z")).toBe("2y ago");
  });

  it("accepts Date objects as well as strings", () => {
    const fiveMinAgo = new Date(NOW.getTime() - 5 * 60_000);
    expect(relativeTimeFromNow(fiveMinAgo)).toBe("5m ago");
  });
});
