import { cn } from "@/lib/utils";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  type LeadStatus,
} from "@/lib/leads/constants";

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        STATUS_BADGE_CLASSES[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
