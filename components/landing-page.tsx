import Link from "next/link";
import { Crosshair, PhoneCall, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Search,
    title: "Find leads",
    body: "Import CSVs from your scrapers and start with a clean, deduped pipeline.",
  },
  {
    icon: PhoneCall,
    title: "Track outreach",
    body: "Status, notes, follow-up dates. One tap to call or pull up the map.",
  },
  {
    icon: TrendingUp,
    title: "Close deals",
    body: "Conversion rate and weekly activity at a glance, on every device.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Crosshair className="size-5" aria-hidden />
            <span>Lead Tracker</span>
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Track your leads, not your spreadsheets.
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-xl text-lg text-pretty">
            Built for freelancers and agencies who want a simple, opinionated
            lead tracker — without the bloat of full CRMs.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Sign up free</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            >
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="bg-muted flex size-10 items-center justify-center rounded-md">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h2 className="font-semibold">{title}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto w-full max-w-6xl px-4 py-6 text-center text-sm sm:px-6">
          Built by Shivam Verma ·{" "}
          <a
            href="https://github.com/Vshivam01"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline underline-offset-4"
          >
            github.com/Vshivam01
          </a>
        </div>
      </footer>
    </div>
  );
}
