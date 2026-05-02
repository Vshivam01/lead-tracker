"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function LeadsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[/leads] render error:", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-lg font-medium">
            Something went wrong loading your leads.
          </p>
          {error.digest ? (
            <Alert variant="destructive" className="text-left">
              <AlertDescription>
                Error reference: <code>{error.digest}</code>
              </AlertDescription>
            </Alert>
          ) : null}
          <div className="flex gap-2">
            <Button onClick={reset}>
              <RefreshCw className="size-4" aria-hidden />
              Retry
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
