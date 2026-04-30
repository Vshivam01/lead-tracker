import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OutreachCard } from "@/components/leads/outreach-card";
import { SignOutButton } from "@/components/leads/sign-out-button";
import { isLeadStatus, type LeadStatus } from "@/lib/leads/constants";
import { createClient } from "@/lib/supabase/server";

type Lead = {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  google_maps_url: string | null;
  rating: number | null;
  total_reviews: number | null;
  hours_today: string | null;
  place_id: string;
  status: LeadStatus;
  notes: string | null;
  next_follow_up_at: string | null;
  last_contacted_at: string | null;
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, business_name, category, city, address, phone, google_maps_url, rating, total_reviews, hours_today, place_id, status, notes, next_follow_up_at, last_contacted_at",
    )
    .eq("id", id)
    .maybeSingle();

  // RLS scopes the SELECT to the current user, so a row owned by another
  // user looks identical to "not found" — both land here.
  if (error || !data || !isLeadStatus(data.status)) {
    redirect("/leads");
  }

  const lead = data as Lead;
  const subtitle = [lead.category, lead.city].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between">
        <Link
          href="/leads"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to leads
        </Link>
        <SignOutButton />
      </header>

      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {lead.business_name}
      </h1>
      {subtitle ? (
        <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
      ) : null}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BusinessInfoCard lead={lead} />
        <OutreachCard
          lead={{
            id: lead.id,
            status: lead.status,
            notes: lead.notes,
            next_follow_up_at: lead.next_follow_up_at,
            last_contacted_at: lead.last_contacted_at,
          }}
        />
      </div>
    </div>
  );
}

function BusinessInfoCard({ lead }: { lead: Lead }) {
  const ratingLine =
    lead.rating != null || lead.total_reviews != null
      ? `${lead.rating ?? "—"} (${lead.total_reviews ?? 0} reviews)`
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {lead.phone ? (
          <a
            href={`tel:${lead.phone}`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center gap-2 rounded-md px-4 py-3 text-base font-medium"
          >
            <Phone className="size-4" aria-hidden />
            Call {lead.phone}
          </a>
        ) : null}

        {lead.google_maps_url ? (
          <Button asChild variant="outline" className="w-full">
            <a
              href={lead.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="size-4" aria-hidden />
              Open in Google Maps
              <ExternalLink className="size-3.5 opacity-70" aria-hidden />
            </a>
          </Button>
        ) : null}

        <dl className="space-y-3">
          {lead.address ? (
            <Field label="Address" value={lead.address} />
          ) : null}
          {ratingLine ? (
            <Field
              label="Rating"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Star
                    className="size-3.5 fill-yellow-400 text-yellow-500"
                    aria-hidden
                  />
                  {ratingLine}
                </span>
              }
            />
          ) : null}
          {lead.hours_today ? (
            <Field label="Hours today" value={lead.hours_today} />
          ) : null}
          <div>
            <dt className="text-muted-foreground text-xs">Place ID</dt>
            <dd className="text-muted-foreground mt-1 font-mono text-xs break-all">
              {lead.place_id}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1 text-sm">{value}</dd>
    </div>
  );
}
