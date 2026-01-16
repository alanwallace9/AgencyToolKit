import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agency Toolkit",
  description: "Customize your GoHighLevel sub-accounts with visual customization, onboarding tours, and personalized images.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className} suppressHydrationWarning>
          {children}
          {/* TODO: Fix toast styling - see docs/SESSION_NOTES_2026-01-16_CRITICAL.md */}
          <Toaster position="top-right" />
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
