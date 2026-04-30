"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadLeads, type UploadResult } from "@/app/upload/actions";

export function UploadForm() {
  const [state, action, pending] = useActionState<
    UploadResult | undefined,
    FormData
  >(uploadLeads, undefined);

  const formRef = useRef<HTMLFormElement>(null);
  const lastShown = useRef<UploadResult | undefined>(undefined);

  useEffect(() => {
    if (!state || state === lastShown.current) return;
    lastShown.current = state;

    if (state.status === "error") {
      toast.error(state.message);
      return;
    }

    const total = state.inserted + state.updated;
    const skipped = state.parseErrors.length;

    if (total === 0 && skipped === 0) {
      toast.warning("No rows found in the file.");
      return;
    }

    toast.success(
      `Imported ${total} leads (${state.updated} updated, ${skipped} skipped due to errors)`,
    );
    if (skipped === 0) formRef.current?.reset();
  }, [state]);

  const errors = state?.status === "ok" ? state.parseErrors : [];

  return (
    <form action={action} ref={formRef} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">CSV file</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          disabled={pending}
          className="cursor-pointer file:mr-3 file:cursor-pointer"
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Upload"}
      </Button>

      {errors.length > 0 ? (
        <Alert variant="destructive">
          <AlertDescription>
            <p className="mb-2 font-medium">
              {errors.length} row{errors.length === 1 ? "" : "s"} skipped:
            </p>
            <ul className="space-y-1 text-sm">
              {errors.slice(0, 5).map((err, i) => (
                <li key={i}>
                  Row {err.row}: {err.message}
                </li>
              ))}
              {errors.length > 5 ? (
                <li className="opacity-70">
                  …and {errors.length - 5} more
                </li>
              ) : null}
            </ul>
          </AlertDescription>
        </Alert>
      ) : null}
    </form>
  );
}
