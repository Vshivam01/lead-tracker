import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col items-center justify-center px-4 py-10">
      <Card className="w-full">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-3xl font-bold tracking-tight">404</p>
          <p className="font-medium">Page not found</p>
          <p className="text-muted-foreground max-w-sm text-sm">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Button asChild className="mt-2">
            <Link href="/">Back to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
