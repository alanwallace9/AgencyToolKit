'use client';

import * as React from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { submitFeedback } from '../_actions/feedback-actions';

interface ArticleFeedbackProps {
  articleId: string;
}

type FeedbackState = 'idle' | 'helpful' | 'not-helpful';

export function ArticleFeedback({ articleId }: ArticleFeedbackProps) {
  const [feedback, setFeedback] = React.useState<FeedbackState>('idle');

  // Load previous feedback from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(`help-feedback-${articleId}`);
    if (stored === 'helpful' || stored === 'not-helpful') {
      setFeedback(stored);
    }
  }, [articleId]);

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type);
    localStorage.setItem(`help-feedback-${articleId}`, type);

    // Fire-and-forget — optimistic UI via localStorage
    submitFeedback(articleId, type === 'helpful');
  };

  if (feedback !== 'idle') {
    return (
      <div className="mt-8 pt-6 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4 text-green-500" />
          Thanks for your feedback!
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-border/50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Was this article helpful?
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback('helpful')}
            className="h-8 px-3 gap-1.5"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Yes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFeedback('not-helpful')}
            className="h-8 px-3 gap-1.5"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            No
          </Button>
        </div>
      </div>
    </div>
  );
}
