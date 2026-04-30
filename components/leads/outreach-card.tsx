"use client";

import {
  useActionState,
  useEffect,
  useOptimistic,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/leads/status-badge";
import {
  LEAD_STATUSES,
  STATUS_LABELS,
  type LeadStatus,
} from "@/lib/leads/constants";
import { relativeTimeFromNow } from "@/lib/format";
import { updateLead, type UpdateLeadResult } from "@/app/leads/[id]/actions";

type Props = {
  lead: {
    id: string;
    status: LeadStatus;
    notes: string | null;
    next_follow_up_at: string | null;
    last_contacted_at: string | null;
  };
};

export function OutreachCard({ lead }: Props) {
  // Editable form state — controlled inputs.
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [followUp, setFollowUp] = useState(lead.next_follow_up_at ?? "");

  // Optimistic mirrors of the *server-believed* state. The badge in the
  // header and the "Last contacted" timestamp render from these so they
  // flip instantly on Save and revert if the action fails.
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<
    LeadStatus,
    LeadStatus
  >(lead.status, (_curr, next) => next);
  const [optimisticContacted, setOptimisticContacted] = useOptimistic<
    string | null,
    string
  >(lead.last_contacted_at, (_curr, next) => next);

  // Wrap the server action with a client-side function that fires the
  // optimistic updates before awaiting the network round-trip.
  // useActionState runs this inside a transition, which is what makes
  // useOptimistic dispatches actually apply.
  async function action(
    _prev: UpdateLeadResult | undefined,
    formData: FormData,
  ): Promise<UpdateLeadResult> {
    const nextStatus = String(formData.get("status") ?? "") as LeadStatus;
    setOptimisticStatus(nextStatus);
    if (nextStatus !== lead.status) {
      setOptimisticContacted(new Date().toISOString());
    }
    return await updateLead(_prev, formData);
  }

  const [state, formAction, pending] = useActionState<
    UpdateLeadResult | undefined,
    FormData
  >(action, undefined);

  // Toast on each new result transition.
  const lastSeen = useRef<UpdateLeadResult | undefined>(undefined);
  useEffect(() => {
    if (!state || state === lastSeen.current) return;
    lastSeen.current = state;
    if (state.ok) toast.success("Saved");
    else toast.error(state.error);
  }, [state]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Outreach</CardTitle>
        <StatusBadge status={optimisticStatus} />
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="id" value={lead.id} />
          {/* Radix Select doesn't always submit a native value reliably across
              versions, so mirror it explicitly. */}
          <input type="hidden" name="status" value={status} />

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as LeadStatus)}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAD_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Call summary, contact info, follow-up cues…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_follow_up_at">Next follow-up</Label>
            <Input
              id="next_follow_up_at"
              name="next_follow_up_at"
              type="date"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              className="w-full sm:w-auto"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-sm">
              Last contacted: {relativeTimeFromNow(optimisticContacted)}
            </p>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
