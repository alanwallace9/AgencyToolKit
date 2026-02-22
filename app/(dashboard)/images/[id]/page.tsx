import { getImageTemplate } from "../_actions/image-actions";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentAgency } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ImageEditor } from "./_components/image-editor";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";
import { DesktopSuggestionBanner } from "@/components/shared/desktop-suggestion-banner";

interface ImageEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ImageEditorPage({ params }: ImageEditorPageProps) {
  const { id } = await params;
  const [template, user, agency] = await Promise.all([
    getImageTemplate(id),
    currentUser(),
    getCurrentAgency(),
  ]);

  if (!template || !agency) {
    notFound();
  }

  const isPro = agency.plan === 'pro';

  // Fetch customers for assignment
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("agency_id", agency.id)
    .eq("is_active", true)
    .order("name");

  // Get user's first name for "Try it with your name" feature
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  return (
    <>
      {!isPro && <UpgradeBanner feature="images" />}
      <DesktopSuggestionBanner featureKey="image-editor" />
      <ImageEditor
        template={template}
        customers={customers || []}
        userName={userName}
        plan={agency.plan}
      />
    </>
  );
}
