import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCurrentAgency } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ImagesClient } from "./_components/images-client";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { ImageTemplate } from "@/types/database";

// Simplified customer type for the picker
type CustomerOption = { id: string; name: string };

export default async function ImagesPage() {
  const agency = await getCurrentAgency();
  const isPro = agency?.plan === "pro";

  // Pro gate
  if (!isPro) {
    return (
      <>
        <PageHeader
          title="Image Personalization"
          description="Create personalized images with customer names"
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Lock className="h-8 w-8 text-muted-foreground" />
            </div>
            <Badge variant="secondary" className="mb-2">
              Pro Feature
            </Badge>
            <h3 className="font-medium">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create dynamic images that include customer names using GHL merge
              tags. Perfect for review request emails.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

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
      <PageHeader
        title="Image Personalization"
        description="Create personalized images with customer names for review requests"
      />

      <ImagesClient
        templates={templates}
        customers={customers}
        userName={userName}
      />
    </>
  );
}
