import { Dashboard } from "@/components/dashboard/dashboard";
import { LandingPage } from "@/components/landing-page";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return <Dashboard />;
  return <LandingPage />;
}
