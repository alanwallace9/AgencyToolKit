import { PageHeader } from "@/components/shared/page-header";
import { getCurrentAgency } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ImagesClient } from "./_components/images-client";
import { currentUser } from "@clerk/nextjs/server";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import type { ImageTemplate } from "@/types/database";

// Simplified customer type for the picker
type CustomerOption = { id: string; name: string };

export default async function ImagesPage() {
  const agency = await getCurrentAgency();
  const isPro = agency?.plan === "pro";

  // Fetch templates and customers
  const supabase = await createClient();

  const [templatesResult, customersResult] = await Promise.all([
    supabase
      .from("image_templates")
      .select("*")
      .eq("agency_id", agency.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("customers")
      .select("id, name")
      .eq("agency_id", agency.id)
      .eq("is_active", true)
      .order("name"),
  ]);

  const templates: ImageTemplate[] = templatesResult.data || [];
  const customers: CustomerOption[] = customersResult.data || [];

  // Get user name for personalized empty state
  const user = await currentUser();
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  return (
    <>
      {!isPro && <UpgradeBanner feature="images" />}
      <PageHeader
        title="Image Personalization"
        description="Create personalized images with customer names for review requests"
      />

      <ImagesClient
        templates={templates}
        customers={customers}
        userName={userName}
        plan={agency?.plan || 'toolkit'}
      />
    </>
  );
}
