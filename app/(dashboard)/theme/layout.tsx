import { ThemeLayoutClient } from "./_components/theme-layout-client"

export default function ThemeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ThemeLayoutClient>{children}</ThemeLayoutClient>
}
