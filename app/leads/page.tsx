import Link from "next/link";
import { Inbox, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LeadsPagination } from "@/components/leads/leads-pagination";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { StatusBadge } from "@/components/leads/status-badge";
import { relativeTimeFromNow } from "@/lib/format";
import {
  isLeadStatus,
  isSortableColumn,
  type LeadStatus,
  type SortableColumn,
} from "@/lib/leads/constants";
import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 25;
const DEFAULT_SORT: SortableColumn = "total_reviews";

type RawSearchParams = {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
  sort?: string | string[];
};

type LeadRow = {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  phone: string | null;
  status: LeadStatus;
  total_reviews: number | null;
  last_contacted_at: string | null;
};

function pickString(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : undefined;
}

// PostgREST `.or(...)` takes a comma/parens-delimited filter expression.
// Strip characters that have meaning in that grammar so a search query
// can't escape into an arbitrary filter.
function sanitizeIlikeTerm(s: string): string {
  return s.replace(/[%,()*:]/g, "").trim();
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const sp = await searchParams;

  const qRaw = pickString(sp.q)?.trim() ?? "";
  const q = sanitizeIlikeTerm(qRaw);
  const status = isLeadStatus(pickString(sp.status))
    ? (pickString(sp.status) as LeadStatus)
    : undefined;
  const sort = isSortableColumn(pickString(sp.sort))
    ? (pickString(sp.sort) as SortableColumn)
    : DEFAULT_SORT;
  const pageRaw = Number.parseInt(pickString(sp.page) ?? "1", 10);
  const page = Math.max(1, Number.isFinite(pageRaw) ? pageRaw : 1);

  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select(
      "id, business_name, category, city, phone, status, total_reviews, last_contacted_at",
      { count: "exact" },
    );

  if (status) query = query.eq("status", status);
  if (q) query = query.or(`business_name.ilike.%${q}%,phone.ilike.%${q}%`);

  const ascending = sort === "business_name";
  query = query
    .order(sort, { ascending, nullsFirst: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, count, error } = await query;
  if (error) console.error("[/leads] query failed:", error);

  const leads = (data ?? []) as LeadRow[];
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = qRaw.length > 0 || !!status;

  function buildHref(targetPage: number): string {
    const params = new URLSearchParams();
    if (qRaw) params.set("q", qRaw);
    if (status) params.set("status", status);
    if (sort !== DEFAULT_SORT) params.set("sort", sort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return `/leads${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Leads</h1>

      <LeadsToolbar />

      <div className="mt-6">
        {leads.length === 0 ? (
          <EmptyState filtered={hasFilters} />
        ) : (
          <>
            <Card className="overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      City
                    </TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden text-right md:table-cell">
                      Reviews
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">
                      Last contacted
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((l) => (
                    <TableRow key={l.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link
                          href={`/leads/${l.id}`}
                          className="hover:underline"
                        >
                          {l.business_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {l.category ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden md:table-cell">
                        {l.city ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.phone ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="hidden text-right tabular-nums md:table-cell">
                        {l.total_reviews ?? "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground hidden lg:table-cell">
                        {relativeTimeFromNow(l.last_contacted_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className="mt-4">
              <LeadsPagination
                page={page}
                pageCount={pageCount}
                total={total}
                prevHref={page > 1 ? buildHref(page - 1) : null}
                nextHref={page < pageCount ? buildHref(page + 1) : null}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  const Icon = filtered ? SearchX : Inbox;
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="bg-muted flex size-12 items-center justify-center rounded-full">
          <Icon className="size-5" aria-hidden />
        </div>
        <p className="font-medium">
          {filtered ? "No leads match these filters." : "No leads yet."}
        </p>
        <p className="text-muted-foreground max-w-sm text-sm">
          {filtered
            ? "Try a different search term or clear the status filter."
            : "Upload a CSV to get started."}
        </p>
        <Button asChild variant={filtered ? "outline" : "default"} className="mt-2">
          <Link href={filtered ? "/leads" : "/upload"}>
            {filtered ? "Clear filters" : "Upload your first leads →"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
