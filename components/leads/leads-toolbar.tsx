"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { LayoutDashboard, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignOutButton } from "@/components/leads/sign-out-button";
import { LEAD_STATUSES, STATUS_LABELS } from "@/lib/leads/constants";

const ALL = "_all";

export function LeadsToolbar() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(sp.get("q") ?? "");
  const isFirstRender = useRef(true);

  // Push the search query into the URL after a 300ms idle period.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const handle = setTimeout(() => {
      const next = new URLSearchParams(sp.toString());
      if (query) next.set("q", query);
      else next.delete("q");
      next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
      });
    }, 300);
    return () => clearTimeout(handle);
  }, [query, pathname, router, sp]);

  function setStatus(value: string) {
    const next = new URLSearchParams(sp.toString());
    if (value === ALL) next.delete("status");
    else next.set("status", value);
    next.delete("page");
    const qs = next.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search business or phone..."
          className="sm:max-w-xs"
        />
        <Select value={sp.get("status") ?? ALL} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {LEAD_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <LayoutDashboard className="size-4" aria-hidden />
            Dashboard
          </Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/upload">
            <Upload className="size-4" aria-hidden />
            Upload
          </Link>
        </Button>
        <SignOutButton />
      </div>
    </div>
  );
}