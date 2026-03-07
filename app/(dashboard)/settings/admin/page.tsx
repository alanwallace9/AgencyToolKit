import { requireSuperAdmin } from '@/lib/auth';
import { AdminFeedbackClient } from './_components/admin-feedback-client';
import { GhlHealthClient } from './_components/ghl-health-client';
import { getFeedbackSummary } from './_actions/admin-feedback-actions';
import { getHealthSummary } from './_actions/health-actions';

export default async function AdminPage() {
  await requireSuperAdmin();
  const [feedback, health] = await Promise.all([
    getFeedbackSummary(),
    getHealthSummary(),
  ]);

  return (
    <div className="max-w-4xl space-y-10">
      <AdminFeedbackClient initialFeedback={feedback} />
      <div className="border-t pt-8">
        <GhlHealthClient summary={health} />
      </div>
    </div>
  );
}
