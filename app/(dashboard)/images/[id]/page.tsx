import { getImageTemplate } from "../_actions/image-actions";
import { notFound } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { ImageEditor } from "./_components/image-editor";

interface ImageEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ImageEditorPage({ params }: ImageEditorPageProps) {
  const { id } = await params;
  const [template, user] = await Promise.all([
    getImageTemplate(id),
    currentUser(),
  ]);

  if (!template) {
    notFound();
  }

  // Get user's first name for "Try it with your name" feature
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0];

  return (
    <ImageEditor
      template={template}
      userName={userName}
    />
  );
}
