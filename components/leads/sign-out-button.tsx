import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/leads/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" size="sm" variant="ghost">
        <LogOut className="size-4" aria-hidden />
        Sign out
      </Button>
    </form>
  );
}
