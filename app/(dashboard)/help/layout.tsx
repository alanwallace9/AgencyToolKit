import { HelpLayoutClient } from './_components/help-layout-client';

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HelpLayoutClient>{children}</HelpLayoutClient>;
}
