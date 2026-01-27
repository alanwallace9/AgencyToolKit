'use client';

import { formatDistanceToNow } from 'date-fns';
import { Check, Circle, ChevronRight, BadgeCheck } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface StepProgress {
  step_id?: string;
  step_order?: number;
  title?: string;
  viewed_at?: string | null;
  completed_at?: string | null;
  verified?: boolean;
  verified_at?: string | null;
}

interface TourProgress {
  id: string;
  tour_id: string;
  tour_name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'dismissed';
  current_step: number;
  total_steps: number;
  step_progress: StepProgress[];
  steps: { title: string; order: number }[];
  started_at: string | null;
  completed_at: string | null;
  last_activity_at: string | null;
}

interface TourProgressCardProps {
  tourProgress: TourProgress[];
}

export function TourProgressCard({ tourProgress }: TourProgressCardProps) {
  if (tourProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Progress</CardTitle>
          <CardDescription>Track tour completion</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No tour activity yet. Progress will appear here once the customer starts a tour.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Progress</CardTitle>
        <CardDescription>Track tour completion</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {tourProgress.map((progress) => (
          <TourProgressItem key={progress.id} progress={progress} />
        ))}
      </CardContent>
    </Card>
  );
}

function TourProgressItem({ progress }: { progress: TourProgress }) {
  const completedSteps = progress.step_progress.filter((s) => s.completed_at).length;
  const progressPercent = progress.total_steps > 0
    ? Math.round((completedSteps / progress.total_steps) * 100)
    : 0;

  return (
    <Collapsible defaultOpen={progress.status === 'in_progress'}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg border hover:bg-muted/50 transition-colors group">
        <div className="flex items-center gap-3">
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
          <div className="text-left">
            <div className="font-medium">{progress.tour_name}</div>
            <div className="text-xs text-muted-foreground">
              {progress.status === 'completed' ? (
                'Completed'
              ) : progress.status === 'in_progress' ? (
                `${completedSteps}/${progress.total_steps} steps`
              ) : (
                'Not started'
              )}
            </div>
          </div>
        </div>
        <StatusBadge status={progress.status} />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 ml-7 space-y-1 border-l-2 border-muted pl-4">
          {progress.steps.map((step, index) => {
            const stepProgress = progress.step_progress.find(
              (sp) => sp.step_order === step.order || sp.step_order === index
            );
            const isCompleted = !!stepProgress?.completed_at;
            const isVerified = !!stepProgress?.verified;
            const isCurrent = !isCompleted && progress.current_step === index;

            return (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 py-1.5 text-sm',
                  isCompleted ? 'text-muted-foreground' : '',
                  isCurrent ? 'text-primary font-medium' : ''
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : isCurrent ? (
                  <Circle className="h-4 w-4 text-primary fill-primary flex-shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                )}
                <span className="flex-1">{step.title || `Step ${index + 1}`}</span>
                {isVerified && (
                  <span title="Verified">
                    <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Timestamps */}
        <div className="mt-3 ml-7 pl-4 text-xs text-muted-foreground space-y-0.5">
          {progress.started_at && (
            <div>
              Started:{' '}
              {formatDistanceToNow(new Date(progress.started_at), { addSuffix: true })}
            </div>
          )}
          {progress.last_activity_at && progress.status !== 'completed' && (
            <div>
              Last activity:{' '}
              {formatDistanceToNow(new Date(progress.last_activity_at), { addSuffix: true })}
            </div>
          )}
          {progress.completed_at && (
            <div>
              Completed:{' '}
              {formatDistanceToNow(new Date(progress.completed_at), { addSuffix: true })}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function StatusBadge({ status }: { status: TourProgress['status'] }) {
  switch (status) {
    case 'completed':
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          Complete
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="secondary">
          In Progress
        </Badge>
      );
    case 'dismissed':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Dismissed
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Not Started
        </Badge>
      );
  }
}
