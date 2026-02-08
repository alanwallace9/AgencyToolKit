'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function HelpSearch() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help articles..."
              className="pl-9 bg-muted/50 border-border/50 cursor-not-allowed"
              disabled
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Search coming soon</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
