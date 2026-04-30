export const LEAD_STATUSES = [
  "not_called",
  "voicemail",
  "interested",
  "not_interested",
  "sold",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  not_called: "Not called",
  voicemail: "Voicemail",
  interested: "Interested",
  not_interested: "Not interested",
  sold: "Sold",
};

// Tailwind-static class strings — JIT can statically extract these.
// (Don't build class names dynamically with template literals; JIT can't see them.)
export const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  not_called:
    "bg-muted text-muted-foreground",
  voicemail:
    "bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200",
  interested:
    "bg-yellow-100 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-200",
  not_interested:
    "bg-red-100 text-red-900 dark:bg-red-950 dark:text-red-200",
  sold:
    "bg-green-100 text-green-900 dark:bg-green-950 dark:text-green-200",
};

export const SORTABLE_COLUMNS = [
  "total_reviews",
  "business_name",
  "created_at",
  "last_contacted_at",
] as const;

export type SortableColumn = (typeof SORTABLE_COLUMNS)[number];

export function isLeadStatus(v: unknown): v is LeadStatus {
  return (
    typeof v === "string" &&
    (LEAD_STATUSES as readonly string[]).includes(v)
  );
}

export function isSortableColumn(v: unknown): v is SortableColumn {
  return (
    typeof v === "string" &&
    (SORTABLE_COLUMNS as readonly string[]).includes(v)
  );
}
