import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Image, Plus, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getCurrentAgency } from "@/lib/auth"

export default async function ImagesPage() {
  const agency = await getCurrentAgency()
  const isPro = agency?.plan === "pro"

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
            <Badge variant="secondary" className="mb-2">Pro Feature</Badge>
            <h3 className="font-medium">Upgrade to Pro</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Create dynamic images that include customer names using GHL merge tags. Perfect for emails and landing pages.
            </p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Image Personalization"
        description="Create personalized images with customer names"
        action={
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Image className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-medium">No image templates yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Upload an image and position text to create personalized graphics using GHL merge tags.
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Coming in Feature 23
          </p>
        </CardContent>
      </Card>
    </>
  )
}
