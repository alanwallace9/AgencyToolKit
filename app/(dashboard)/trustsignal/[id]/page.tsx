import { redirect, notFound } from 'next/navigation';
import { getCurrentAgency } from '@/lib/auth';
import { getWidget, getEvents } from '../_actions/social-proof-actions';
import { WidgetEditor } from './_components/widget-editor';

interface WidgetEditorPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function WidgetEditorPage({
  params,
  searchParams,
}: WidgetEditorPageProps) {
  const agency = await getCurrentAgency();

  if (!agency) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const { tab } = await searchParams;

  let widget, events, total;
  try {
    widget = await getWidget(id);
    ({ events, total } = await getEvents(id, { limit: 100 }));
  } catch {
    notFound();
  }

  return (
    <WidgetEditor
      widget={widget!}
      events={events!}
      totalEvents={total!}
      agency={agency}
      initialTab={tab || 'settings'}
    />
  );
}
