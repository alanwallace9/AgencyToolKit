import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowRight, Sparkles, Map, Image } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const proFeatures: Record<
  string,
  {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    benefits: string[]
  }
> = {
  tours: {
    title: "Onboarding Tours",
    description:
      "Guide your customers through your app with interactive, step-by-step tours powered by Driver.js.",
    icon: Map,
    benefits: [
      "Create unlimited onboarding tours",
      "Visual step builder with live preview",
      "Track completion rates per customer",
      "Customize tour appearance to match your brand",
      "Trigger tours based on user actions",
    ],
  },
  images: {
    title: "Image Personalization",
    description:
      "Generate dynamic, branded images personalized for each customer using their data.",
    icon: Image,
    benefits: [
      "Create custom image templates",
      "Auto-generate images with customer data",
      "Use for email headers, social media, reports",
      "Cloudflare R2 storage included",
      "High-performance edge delivery",
    ],
  },
}

interface UpgradePageProps {
  params: Promise<{
    feature: string
  }>
}

export default async function UpgradePage({ params }: UpgradePageProps) {
  const { feature } = await params

  const featureData = proFeatures[feature]

  if (!featureData) {
    notFound()
  }

  const Icon = featureData.icon

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{featureData.title}</CardTitle>
          <CardDescription className="text-base">
            {featureData.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              Included with Pro:
            </p>
            <ul className="space-y-2">
              {featureData.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full" size="lg" asChild>
            <Link href="/settings">
              Upgrade to Pro
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
