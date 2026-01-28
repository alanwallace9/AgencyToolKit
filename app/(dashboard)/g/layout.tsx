import { GuidelySidebar } from "./_components/guidely-sidebar"

export default function GuidelyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 top-16 flex">
      <GuidelySidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
