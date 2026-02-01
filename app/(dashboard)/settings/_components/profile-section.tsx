'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProBadge } from '@/components/shared/pro-badge';
import { Badge } from '@/components/ui/badge';
import { Check, Pencil, X, Loader2, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { updateAgencyName } from '../_actions/settings-actions';

interface ProfileSectionProps {
  agency: {
    id: string;
    name: string;
    email: string;
    plan: 'toolkit' | 'pro';
    token: string;
  };
}

export function ProfileSection({ agency }: ProfileSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(agency.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Agency name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateAgencyName(name.trim());
      toast.success('Agency name updated');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update agency name', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(agency.name || '');
    setIsEditing(false);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(agency.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Your agency information and account details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agency Details</CardTitle>
          <CardDescription>Manage your agency profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Agency Name - Editable */}
          <div className="space-y-2">
            <Label htmlFor="agency-name">Agency Name</Label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  id="agency-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter agency name"
                  className="max-w-sm"
                  disabled={isSaving}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm">{agency.name || 'Not set'}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Email - Read Only */}
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{agency.email}</p>
            <p className="text-xs text-muted-foreground">
              Email is managed by your login provider
            </p>
          </div>

          {/* Plan */}
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="flex items-center gap-2">
              {agency.plan === 'pro' ? (
                <ProBadge />
              ) : (
                <Badge variant="secondary">Toolkit</Badge>
              )}
            </div>
          </div>

          {/* Token */}
          <div className="space-y-2">
            <Label>Agency Token</Label>
            <div className="flex items-center gap-2">
              <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {agency.token}
              </code>
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="h-3 w-3" />
                  <span className="text-xs font-medium">Copied</span>
                </span>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={copyToken}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Used in your embed script to identify your agency
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
