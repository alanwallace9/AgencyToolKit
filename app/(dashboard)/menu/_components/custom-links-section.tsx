'use client';

import { Link2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function CustomLinksSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Custom Menu Links
        </CardTitle>
        <CardDescription>
          Sync custom menu links from your GoHighLevel account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder Message */}
        <div className="rounded-lg border border-dashed p-6 text-center">
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Link2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Custom menu links will appear here after syncing with GHL
          </p>
        </div>

        {/* Sync Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync with GHL
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Coming Soon</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
