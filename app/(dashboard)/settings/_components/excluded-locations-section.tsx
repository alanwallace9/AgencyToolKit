'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, X, Copy, Info, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addExcludedLocation, removeExcludedLocation } from '../_actions/settings-actions';

interface ExcludedLocationsSectionProps {
  locations: string[];
}

export function ExcludedLocationsSection({ locations: initialLocations }: ExcludedLocationsSectionProps) {
  const [locations, setLocations] = useState<string[]>(initialLocations || []);
  const [newLocation, setNewLocation] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleAdd = async () => {
    const locationId = newLocation.trim();
    if (!locationId) {
      toast.error('Please enter a location ID');
      return;
    }

    if (locations.includes(locationId)) {
      toast.error('This location is already excluded');
      return;
    }

    setIsAdding(true);
    try {
      await addExcludedLocation(locationId);
      setLocations([...locations, locationId]);
      setNewLocation('');
      toast.success('Location added to exclusion list');
    } catch (error) {
      toast.error('Failed to add location', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (locationId: string) => {
    setRemovingId(locationId);
    try {
      await removeExcludedLocation(locationId);
      setLocations(locations.filter((id) => id !== locationId));
      toast.success('Location removed from exclusion list');
    } catch (error) {
      toast.error('Failed to remove location', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const copyAll = () => {
    if (locations.length === 0) {
      toast.error('No locations to copy');
      return;
    }
    navigator.clipboard.writeText(locations.join('\n'));
    toast.success(`Copied ${locations.length} location ID${locations.length === 1 ? '' : 's'}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Excluded Locations</h2>
        <p className="text-sm text-muted-foreground">
          GHL locations where the embed script will NOT run
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Add GHL location IDs to exclude them from your customizations. Useful for demo accounts,
          test locations, or client accounts that shouldn&apos;t receive your branding.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Manage Excluded Locations</CardTitle>
          <CardDescription>
            {locations.length === 0
              ? 'No locations excluded - embed script runs everywhere'
              : `${locations.length} location${locations.length === 1 ? '' : 's'} excluded`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Location */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="new-location" className="sr-only">
                Location ID
              </Label>
              <Input
                id="new-location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Enter GHL Location ID"
                disabled={isAdding}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
            </div>
            <Button
              onClick={handleAdd}
              disabled={isAdding || !newLocation.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span className="ml-2">Add</span>
            </Button>
          </div>

          {/* Location List */}
          {locations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Excluded Location IDs
                </Label>
                <Button variant="ghost" size="sm" onClick={copyAll}>
                  <Copy className="h-3 w-3 mr-1" />
                  Copy All
                </Button>
              </div>
              <div className="space-y-2">
                {locations.map((locationId) => (
                  <div
                    key={locationId}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <code className="text-sm font-mono">{locationId}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(locationId)}
                      disabled={removingId === locationId}
                    >
                      {removingId === locationId ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {locations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No excluded locations. Your embed script will run on all GHL locations.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
