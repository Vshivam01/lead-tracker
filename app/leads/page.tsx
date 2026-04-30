import Link from "next/link";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LeadsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
      </div>

      <Card className="mt-6">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="bg-muted flex size-12 items-center justify-center rounded-full">
            <Upload className="size-5" aria-hidden />
          </div>
          <p className="font-medium">No leads yet</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            Import a CSV from your lead-finder export to get started. The table
            view lands in the next commit.
          </p>
          <Button asChild className="mt-2">
            <Link href="/upload">Upload your first leads →</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
