import { auth } from "@clerk/nextjs/server";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Step 1: Get Clerk auth info
    const authResult = await auth();
    const { userId, sessionId } = authResult;

    // Step 2: If we have a userId, try the Supabase query
    let supabaseResult = null;
    let supabaseError = null;

    if (userId) {
      try {
        const supabase = await createClient();
        const { data, error } = await supabase
          .from("agencies")
          .select("id, clerk_user_id, email, name, plan")
          .eq("clerk_user_id", userId)
          .single();

        supabaseResult = data;
        supabaseError = error?.message || null;
      } catch (e) {
        supabaseError = e instanceof Error ? e.message : "Unknown Supabase error";
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      clerk: {
        userId: userId || null,
        sessionId: sessionId || null,
        hasSession: !!sessionId,
      },
      supabase: {
        agency: supabaseResult,
        error: supabaseError,
        queryWouldSucceed: !!supabaseResult,
      },
      diagnosis: !userId
        ? "NO_CLERK_SESSION - Clerk auth() returned no userId"
        : !supabaseResult
        ? "NO_AGENCY_RECORD - Clerk authenticated but no agency in Supabase"
        : "OK - Both Clerk and Supabase working",
    });
  } catch (error) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      diagnosis: "ERROR - Something threw an exception",
    });
  }
}
