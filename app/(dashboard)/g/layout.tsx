import { getCurrentAgency } from "@/lib/auth"
import { GuidelyLayoutClient } from "./_components/guidely-layout-client"

export default async function GuidelyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const agency = await getCurrentAgency()
  const isPro = agency?.plan === 'pro'

  return <GuidelyLayoutClient isPro={isPro}>{children}</GuidelyLayoutClient>
}
