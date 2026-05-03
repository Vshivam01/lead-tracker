export type Pagination = {
  totalPages: number;
  currentPage: number;
  hasPrev: boolean;
  hasNext: boolean;
  rangeStart: number;
  rangeEnd: number;
};

/**
 * Pure pagination math.
 *
 * - Inputs are sanitized: pageSize floored & clamped to ≥ 1 (no /0),
 *   total clamped to ≥ 0, currentPage clamped to [1, totalPages].
 * - totalPages is at least 1 even when total = 0, so the UI can render
 *   "Page 1 of 1" rather than "Page 1 of 0".
 * - rangeStart/rangeEnd are 0-indexed and inclusive — the shape Supabase's
 *   `.range(start, end)` expects.
 */
export function computePagination(
  total: number,
  currentPage: number,
  pageSize: number,
): Pagination {
  const safeSize = Math.max(1, Math.floor(pageSize) || 1);
  const safeTotal = Math.max(0, Math.floor(Number.isFinite(total) ? total : 0));
  const totalPages = Math.max(1, Math.ceil(safeTotal / safeSize));

  const requested = Math.floor(Number.isFinite(currentPage) ? currentPage : 1);
  const safePage = Math.min(totalPages, Math.max(1, requested));

  return {
    totalPages,
    currentPage: safePage,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
    rangeStart: (safePage - 1) * safeSize,
    rangeEnd: safePage * safeSize - 1,
  };
}
