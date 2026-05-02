import Link from "next/link";
import {
  Crosshair,
  PhoneCall,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { SignOutButton } from "@/components/leads/sign-out-button";
import { StatusBadge } from "@/components/leads/status-badge";
import {
  computeConversionRate,
  getContactedThisWeek,
  getRecentLeads,
  getStatusCounts,
  getTotalLeads,
} from "@/lib/dashboard/queries";
import { relativeTimeFromNow } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function Dashboard() {
  const supabase = await createClient();

  // Run the four queries concurrently. Sequential, they'd add ~4× the
  // network round-trip latency to TTFB; in parallel, total wait ≈ slowest.
  const [total, contactedWeek, statusCounts, recent] = await Promise.all([
    getTotalLeads(supabase),
    getContactedThisWeek(supabase),
    getStatusCounts(supabase),
    getRecentLeads(supabase),
  ]);

  const conversionRate = computeConversionRate(statusCounts);
  const formattedRate =
    conversionRate === null ? "—" : `${conversionRate.toFixed(1)}%`;

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Crosshair className="size-5" aria-hidden />
            <span>Lead Tracker</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/leads">Leads</Link>
            </Button>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

        {total === 0 ? (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="font-medium">No leads yet.</p>
              <p className="text-muted-foreground max-w-sm text-sm">
                Upload a CSV from your lead-finder export to start tracking.
              </p>
              <Button asChild className="mt-2">
                <Link href="/upload">Upload your first leads →</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total leads" value={total} icon={Users} />
              <StatCard
                label="Contacted this week"
                value={contactedWeek}
                icon={PhoneCall}
              />
              <StatCard
                label="Interested"
                value={statusCounts.interested}
                icon={ThumbsUp}
              />
              <StatCard
                label="Conversion rate"
                value={formattedRate}
                hint="sold ÷ contacted"
                icon={TrendingUp}
              />
            </div>

            <section className="mt-10">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent activity</h2>
                <Link
                  href="/leads"
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  View all leads →
                </Link>
              </div>

              {recent.length === 0 ? (
                <Card>
                  <CardContent className="text-muted-foreground py-8 text-center text-sm">
                    No activity yet.
                  </CardContent>
                </Card>
              ) : (
                <Card className="overflow-hidden p-0">
                  <ul className="divide-border divide-y">
                    {recent.map((l) => (
                      <li key={l.id}>
                        <Link
                          href={`/leads/${l.id}`}
                          className="hover:bg-muted/50 flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <span className="truncate font-medium">
                            {l.business_name}
                          </span>
                          <span className="flex shrink-0 items-center gap-3">
                            <StatusBadge status={l.status} />
                            <span className="text-muted-foreground hidden text-xs sm:inline">
                              {relativeTimeFromNow(l.updated_at)}
                            </span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
