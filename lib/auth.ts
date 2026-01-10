import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentAgency() {
  const { userId } = await auth();
  if (!userId) return null;

  const supabase = await createClient();
  const { data: agency } = await supabase
    .from("agencies")
    .select("*")
    .eq("clerk_user_id", userId)
    .single();

  return agency;
}
