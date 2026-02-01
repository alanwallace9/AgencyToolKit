import { GuidelySidebar } from "./_components/guidely-sidebar"
import { getCurrentAgency } from "@/lib/auth"
import { UpgradeBanner } from "@/components/shared/upgrade-banner"

export default async function GuidelyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const agency = await getCurrentAgency()
  const isPro = agency?.plan === 'pro'

  return (
    <div className="fixed inset-0 top-16 flex flex-col">
      {!isPro && <UpgradeBanner feature="guidely" />}
      <div className="flex flex-1 overflow-hidden">
        <GuidelySidebar />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
