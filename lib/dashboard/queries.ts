import type { createClient } from "@/lib/supabase/server";
import type { LeadStatus } from "@/lib/leads/constants";

type Supabase = Awaited<ReturnType<typeof createClient>>;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export type StatusCounts = Record<LeadStatus, number>;

/**
 * Total leads owned by the current user.
 * `head: true` skips the row payload — Postgres returns just the count.
 */
export async function getTotalLeads(supabase: Supabase): Promise<number> {
  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

/**
 * Leads contacted in the last 7 days. "Contacted" = any status change off
 * the default, which is what the DB trigger stamps into last_contacted_at.
 */
export async function getContactedThisWeek(
  supabase: Supabase,
): Promise<number> {
  const since = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();
  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .gte("last_contacted_at", since);
  return count ?? 0;
}

/**
 * Counts per status, derived from a single SELECT of just the status column.
 * For our scale (<5k rows/user) this is cheaper than 5 separate count queries
 * (1 round-trip vs. 5). At larger scale, switch to a Postgres RPC that does
 * `select status, count(*) group by status` server-side.
 */
export async function getStatusCounts(
  supabase: Supabase,
): Promise<StatusCounts> {
  const counts: StatusCounts = {
    not_called: 0,
    voicemail: 0,
    interested: 0,
    not_interested: 0,
    sold: 0,
  };
  const { data } = await supabase.from("leads").select("status");
  for (const row of data ?? []) {
    const s = row.status as LeadStatus;
    if (s in counts) counts[s] += 1;
  }
  return counts;
}

export type RecentLead = {
  id: string;
  business_name: string;
  status: LeadStatus;
  updated_at: string;
};

export async function getRecentLeads(
  supabase: Supabase,
): Promise<RecentLead[]> {
  const { data } = await supabase
    .from("leads")
    .select("id, business_name, status, updated_at")
    .order("updated_at", { ascending: false })
    .limit(5);
  return (data ?? []) as RecentLead[];
}

/**
 * Conversion rate among *contacted* leads only.
 *   sold / (sold + interested + voicemail + not_interested)
 *
 * Returns null when there are zero contacted leads — caller renders "—".
 * Excluding `not_called` matters: untouched leads aren't failed conversions,
 * they just haven't entered the funnel yet.
 */
export function computeConversionRate(s: StatusCounts): number | null {
  const contacted = s.sold + s.interested + s.voicemail + s.not_interested;
  if (contacted === 0) return null;
  return (s.sold / contacted) * 100;
}
