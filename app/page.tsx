import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Agency Toolkit</h1>
      <p className="mt-4 text-muted-foreground">
        Customize your GoHighLevel sub-accounts
      </p>

      <div className="mt-8 flex gap-4">
        <SignedOut>
          <SignInButton mode="modal">
            <Button variant="outline">Sign In</Button>
          </SignInButton>
          <SignUpButton mode="modal">
            <Button>Get Started</Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <SignOutButton>
            <Button variant="outline">Sign Out</Button>
          </SignOutButton>
        </SignedIn>
      </div>
    </main>
  );
}
