import { getImageTemplate } from "../_actions/image-actions";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentAgency } from "@/lib/auth";
import { ImageEditor } from "./_components/image-editor";
import { UpgradeBanner } from "@/components/shared/upgrade-banner";

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

  // Get user's first name for "Try it with your name" feature
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  return (
    <>
      {!isPro && <UpgradeBanner feature="images" />}
      <ImageEditor
        template={template}
        userName={userName}
        plan={agency.plan}
      />
    </>
  );
}
