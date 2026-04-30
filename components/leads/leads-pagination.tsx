import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  prevHref: string | null;
  nextHref: string | null;
};

export function LeadsPagination({
  page,
  pageCount,
  total,
  prevHref,
  nextHref,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-muted-foreground text-sm">
        Page {page} of {pageCount} · {total} lead{total === 1 ? "" : "s"} total
      </p>
      <div className="flex gap-2">
        {prevHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={prevHref}>
              <ChevronLeft className="size-4" aria-hidden />
              Prev
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="size-4" aria-hidden />
            Prev
          </Button>
        )}
        {nextHref ? (
          <Button asChild variant="outline" size="sm">
            <Link href={nextHref}>
              Next
              <ChevronRight className="size-4" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        )}
      </div>
    </div>
  );
}
