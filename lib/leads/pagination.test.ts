import { describe, expect, it } from "vitest";
import { computePagination } from "./pagination";

describe("computePagination", () => {
  it("handles an empty result set", () => {
    expect(computePagination(0, 1, 25)).toEqual({
      totalPages: 1,
      currentPage: 1,
      hasPrev: false,
      hasNext: false,
      rangeStart: 0,
      rangeEnd: 24,
    });
  });

  it("returns a single page when total ≤ pageSize", () => {
    const p = computePagination(10, 1, 25);
    expect(p.totalPages).toBe(1);
    expect(p.hasNext).toBe(false);
    expect(p.hasPrev).toBe(false);
  });

  it("does not spill into a second page when total exactly equals pageSize", () => {
    const p = computePagination(25, 1, 25);
    expect(p.totalPages).toBe(1);
    expect(p.hasNext).toBe(false);
  });

  it("starts a second page at total = pageSize + 1", () => {
    const p = computePagination(26, 1, 25);
    expect(p.totalPages).toBe(2);
    expect(p.hasNext).toBe(true);
  });

  it("computes range bounds for the middle page of a multi-page result", () => {
    const p = computePagination(100, 2, 25);
    expect(p.totalPages).toBe(4);
    expect(p.currentPage).toBe(2);
    expect(p.hasPrev).toBe(true);
    expect(p.hasNext).toBe(true);
    expect(p.rangeStart).toBe(25);
    expect(p.rangeEnd).toBe(49);
  });

  it("flags hasPrev=false on the first page", () => {
    const p = computePagination(100, 1, 25);
    expect(p.hasPrev).toBe(false);
    expect(p.hasNext).toBe(true);
  });

  it("flags hasNext=false on the last page", () => {
    const p = computePagination(100, 4, 25);
    expect(p.hasPrev).toBe(true);
    expect(p.hasNext).toBe(false);
    expect(p.rangeStart).toBe(75);
    expect(p.rangeEnd).toBe(99);
  });

  it("clamps currentPage when it exceeds totalPages", () => {
    const p = computePagination(50, 99, 25);
    expect(p.currentPage).toBe(2);
    expect(p.totalPages).toBe(2);
    expect(p.hasNext).toBe(false);
  });

  it("clamps currentPage to 1 when given 0 or negative", () => {
    expect(computePagination(50, 0, 25).currentPage).toBe(1);
    expect(computePagination(50, -5, 25).currentPage).toBe(1);
  });

  it("clamps currentPage to 1 when given NaN", () => {
    expect(computePagination(50, Number.NaN, 25).currentPage).toBe(1);
  });

  it("defends against pageSize = 0 (no divide-by-zero)", () => {
    const p = computePagination(50, 1, 0);
    expect(Number.isFinite(p.totalPages)).toBe(true);
    expect(p.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("defends against negative pageSize", () => {
    const p = computePagination(50, 1, -5);
    expect(Number.isFinite(p.totalPages)).toBe(true);
    expect(p.totalPages).toBeGreaterThanOrEqual(1);
  });

  it("treats negative total as 0", () => {
    const p = computePagination(-10, 1, 25);
    expect(p.totalPages).toBe(1);
    expect(p.rangeStart).toBe(0);
  });
});
