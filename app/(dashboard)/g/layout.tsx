import { GuidelySidebar } from "./_components/guidely-sidebar"

export default function GuidelyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[calc(100vh-4rem-4rem)] -my-8 -mx-8 lg:-mx-14">
      <GuidelySidebar />
      <main className="flex-1 overflow-auto py-8 px-8 lg:px-14">
        {children}
      </main>
    </div>
  )
}
