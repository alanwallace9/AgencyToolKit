import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generateAgencyToken } from '@/lib/tokens';

export async function POST(request: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return new Response('Server configuration error', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const supabase = createAdminClient();

  // Handle user.created event
  if (evt.type === 'user.created') {
    try {
      const { id, email_addresses, first_name, last_name } = evt.data;
      const email = email_addresses?.[0]?.email_address || `${id}@placeholder.local`;
      const name = [first_name, last_name].filter(Boolean).join(' ') || 'My Agency';

      console.log('Creating agency for:', { id, email, name });

      const { error } = await supabase.from('agencies').insert({
        clerk_user_id: id,
        email: email,
        name: name,
        token: generateAgencyToken(name),
        plan: 'free',
      });

      if (error) {
        console.error('Failed to create agency:', error);
        return new Response(`Failed to create agency: ${error.message}`, { status: 500 });
      }

      console.log(`Agency created for user ${id}`);
    } catch (err) {
      console.error('Unexpected error in user.created handler:', err);
      return new Response(`Unexpected error: ${err}`, { status: 500 });
    }
  }

  // Handle user.deleted event
  if (evt.type === 'user.deleted') {
    const { id } = evt.data;

    if (id) {
      const { error } = await supabase
        .from('agencies')
        .delete()
        .eq('clerk_user_id', id);

      if (error) {
        console.error('Failed to delete agency:', error);
        return new Response('Failed to delete agency', { status: 500 });
      }

      console.log(`Agency deleted for user ${id}`);
    }
  }

  return new Response('OK', { status: 200 });
}
