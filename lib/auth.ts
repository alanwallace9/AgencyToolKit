import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getCurrentAgency() {
  const { userId } = await auth();
  if (!userId) return null;

  // Use admin client to bypass RLS (we use Clerk, not Supabase Auth)
  const supabase = createAdminClient();
  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  return agency;
}
