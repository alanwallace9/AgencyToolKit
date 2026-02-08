import { requireSuperAdmin } from '@/lib/auth';
import { AdminFeedbackClient } from './_components/admin-feedback-client';
import { getFeedbackSummary } from './_actions/admin-feedback-actions';

export default async function AdminPage() {
  await requireSuperAdmin();
  const feedback = await getFeedbackSummary();

  return <AdminFeedbackClient initialFeedback={feedback} />;
}
