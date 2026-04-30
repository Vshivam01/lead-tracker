import Link from "next/link";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/leads"
        className="text-muted-foreground hover:text-foreground text-sm"
      >
        ← Back to leads
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Lead detail
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Lead ID:{" "}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">{id}</code>
      </p>
      <p className="text-muted-foreground mt-4 text-sm">
        Detail view ships in commit 11.
      </p>
    </div>
  );
}
