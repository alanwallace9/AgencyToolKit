'use client';

import Link from 'next/link';
import { ImageIcon, Sparkles, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  onCreateClick: () => void;
  userName?: string;
}

export function EmptyState({ onCreateClick, userName }: EmptyStateProps) {
  // Use first name if available
  const displayName = userName?.split(' ')[0] || 'Friend';

  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {/* Demo Preview */}
        <div className="relative mb-6">
          <div className="w-64 h-40 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
            {/* Simulated team photo placeholder */}
            <div className="absolute inset-0 bg-[url('/demo-team.jpg')] bg-cover bg-center opacity-30" />
            <div className="relative z-10">
              <span className="inline-block px-3 py-1.5 bg-white/90 rounded-md text-sm font-semibold text-gray-800 shadow">
                Welcome {displayName}!
              </span>
            </div>
          </div>
          <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-500" />
        </div>

        <h3 className="text-lg font-semibold">Personalized Review Images</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          Upload your team photo and add a personalized greeting. When Sarah gets your review request,
          she&apos;ll see <strong>&quot;Hi Sarah!&quot;</strong> right on the image.
        </p>

        <div className="flex flex-col items-center gap-3 mt-6">
          <Button onClick={onCreateClick} size="lg">
            <ImageIcon className="h-4 w-4 mr-2" />
            Create Your First Image
          </Button>
          <p className="text-xs text-muted-foreground">
            Works with any GHL email or SMS workflow
          </p>
          <Link
            href="/help/images"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
          >
            <HelpCircle className="h-3 w-3" />
            View full guide
          </Link>
        </div>

        {/* How it works */}
        <div className="mt-8 pt-6 border-t w-full max-w-lg">
          <h4 className="text-sm font-medium mb-4">How it works</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <p className="text-xs text-muted-foreground">Upload team photo</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <p className="text-xs text-muted-foreground">Position the name</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <p className="text-xs text-muted-foreground">Copy URL to GHL</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
