"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root] render error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="text-lg font-medium">Something went wrong.</p>
          <p className="text-muted-foreground text-sm">
            An unexpected error happened. Try again, or head back home.
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
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
