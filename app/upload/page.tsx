import Link from "next/link";
import { UploadForm } from "@/components/leads/upload-form";

export default function UploadPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          href="/leads"
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          ← Back to leads
        </Link>
      </div>

      <h1 className="text-2xl font-semibold tracking-tight">Upload leads</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Upload a CSV exported from{" "}
        <a
          href="https://github.com/Vshivam01/lead-finder"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground underline underline-offset-4"
        >
          lead-finder
        </a>
        . Existing leads with the same{" "}
        <code className="bg-muted rounded px-1 py-0.5 text-xs">place_id</code>{" "}
        will be updated, not duplicated.
      </p>

      <div className="mt-6">
        <UploadForm />
      </div>
    </div>
  );
}
