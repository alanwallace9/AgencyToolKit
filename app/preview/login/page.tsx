'use server';

import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase/server';
import { LoginPreview } from './_components/login-preview';
import type { LoginDesign } from '@/types/database';

export default async function LoginPreviewPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Please sign in to preview your login design.</p>
      </div>
    );
  }

  const supabase = await createServerClient();

  // Get the agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .eq('clerk_user_id', userId)
    .single();

  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Agency not found.</p>
      </div>
    );
  }

  // Get the default login design
  const { data: design } = await supabase
    .from('login_designs')
    .select('*')
    .eq('agency_id', agency.id)
    .eq('is_default', true)
    .single();

  return <LoginPreview design={design as LoginDesign | null} />;
}
