'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dices, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeftPanelProps {
  previewName: string;
  onPreviewNameChange: (name: string) => void;
  onDiceRoll: () => void;
  sampleNames: string[];
  userName?: string; // From Clerk for "Try it with your name"
}

export function LeftPanel({
  previewName,
  onPreviewNameChange,
  onDiceRoll,
  sampleNames,
  userName,
}: LeftPanelProps) {
  const [customName, setCustomName] = useState('');

  const handleCustomNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onPreviewNameChange(customName.trim());
    }
  };

  const handleUseMyName = () => {
    if (userName) {
      onPreviewNameChange(userName);
    }
  };

  return (
    <div className="w-64 border-r bg-background flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Sample Names */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Preview Name</Label>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5"
                onClick={onDiceRoll}
                title="Random long name (for stress testing)"
              >
                <Dices className="h-3.5 w-3.5" />
                Long
              </Button>
            </div>

            {/* Try with your name */}
            {userName && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-8 text-muted-foreground hover:text-foreground"
                onClick={handleUseMyName}
              >
                <User className="h-3.5 w-3.5 mr-2" />
                Try it with "{userName}"
              </Button>
            )}

            {/* Custom Name Input */}
            <form onSubmit={handleCustomNameSubmit} className="flex gap-2">
              <Input
                placeholder="Custom name..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="h-8 text-sm"
              />
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8 px-3"
                disabled={!customName.trim()}
              >
                Try
              </Button>
            </form>

            {/* Sample Names List */}
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {sampleNames.slice(0, 20).map((name) => (
                <button
                  key={name}
                  className={cn(
                    'w-full text-left px-2 py-1.5 rounded-md text-sm transition-colors',
                    previewName === name
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted text-muted-foreground'
                  )}
                  onClick={() => onPreviewNameChange(name)}
                >
                  {name}
                  {name.length >= 10 && (
                    <span className="ml-2 text-xs text-muted-foreground/60">
                      ({name.length} chars)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
