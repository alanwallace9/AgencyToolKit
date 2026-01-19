'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { importEvents } from '../../_actions/social-proof-actions';
import type { SocialProofEventType } from '@/types/database';

// Sample CSV content for download
const SAMPLE_CSV = `first_name,business_name,city
John,Acme Marketing,Austin
Sarah,Smith Agency,Denver
Mike,Portland Digital,Portland
Emily,Coastal Media,San Diego
David,Mountain View Co,Seattle`;

const EXPECTED_HEADERS = [
  { name: 'first_name', description: 'Contact first name', required: false },
  { name: 'business_name', description: 'Company or business name', required: false },
  { name: 'city', description: 'Location/city name', required: false },
];

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  widgetId: string;
  onImportComplete: () => void;
}

interface ParsedCsv {
  headers: string[];
  rows: Array<Record<string, string>>;
}

const EVENT_TYPES: Array<{ value: SocialProofEventType; label: string }> = [
  { value: 'signup', label: 'Signed Up' },
  { value: 'trial', label: 'Started Trial' },
  { value: 'demo', label: 'Requested Demo' },
  { value: 'custom', label: 'Custom' },
];

export function CsvImportDialog({
  open,
  onOpenChange,
  widgetId,
  onImportComplete,
}: CsvImportDialogProps) {
  const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
  const [isImporting, setIsImporting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [columnMapping, setColumnMapping] = useState<{
    first_name: string;
    business_name: string;
    city: string;
  }>({
    first_name: '',
    business_name: '',
    city: '',
  });
  const [eventType, setEventType] = useState<SocialProofEventType>('signup');
  const [useTimeOverride, setUseTimeOverride] = useState(true);

  const resetState = () => {
    setStep('upload');
    setFile(null);
    setParsedCsv(null);
    setColumnMapping({ first_name: '', business_name: '', city: '' });
    setEventType('signup');
    setUseTimeOverride(true);
  };

  // Download sample CSV
  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social-proof-sample.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Parse CSV file
  const parseCSV = (text: string): ParsedCsv => {
    const lines = text.split('\n').filter((line) => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    // Parse headers
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));

    // Parse rows
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^["']|["']$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });

    return { headers, rows };
  };

  // Handle file upload
  const handleFileUpload = useCallback((uploadedFile: File) => {
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setParsedCsv(parsed);

      // Auto-detect column mappings
      const autoMap = { first_name: '', business_name: '', city: '' };
      parsed.headers.forEach((header) => {
        const lowerHeader = header.toLowerCase();
        if (
          lowerHeader.includes('first') ||
          lowerHeader === 'name' ||
          lowerHeader.includes('firstname')
        ) {
          autoMap.first_name = header;
        }
        if (
          lowerHeader.includes('company') ||
          lowerHeader.includes('business') ||
          lowerHeader.includes('organization')
        ) {
          autoMap.business_name = header;
        }
        if (lowerHeader.includes('city') || lowerHeader.includes('location')) {
          autoMap.city = header;
        }
      });
      setColumnMapping(autoMap);

      setStep('map');
    };
    reader.readAsText(uploadedFile);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type === 'text/csv') {
        handleFileUpload(droppedFile);
      } else {
        toast.error('Please upload a CSV file');
      }
    },
    [handleFileUpload]
  );

  // Handle import
  const handleImport = async () => {
    if (!parsedCsv) return;

    setIsImporting(true);
    try {
      const result = await importEvents(
        widgetId,
        parsedCsv.rows,
        {
          column_mapping: columnMapping,
          default_event_type: eventType,
          use_time_override: useTimeOverride,
          time_override_text: 'recently',
        }
      );

      toast.success(`Imported ${result.imported} events`);
      if (result.skipped > 0) {
        toast.info(`Skipped ${result.skipped} rows (missing name)`);
      }

      resetState();
      onOpenChange(false);
      onImportComplete();
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import events');
    } finally {
      setIsImporting(false);
    }
  };

  // Get preview rows
  const previewRows = parsedCsv?.rows.slice(0, 3).map((row) => ({
    first_name: columnMapping.first_name ? row[columnMapping.first_name] : '',
    business_name: columnMapping.business_name ? row[columnMapping.business_name] : '',
    city: columnMapping.city ? row[columnMapping.city] : '',
  }));

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetState();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import Events from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import historical events.
          </DialogDescription>
        </DialogHeader>

        {step === 'upload' && (
          <div className="py-4 space-y-4">
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drop your CSV file here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports .csv files with headers
              </p>
            </div>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileUpload(f);
              }}
            />

            {/* Expected Headers */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Expected Column Headers</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSample();
                  }}
                >
                  <Download className="h-3 w-3 mr-1" />
                  Download Sample
                </Button>
              </div>
              <div className="grid gap-1.5">
                {EXPECTED_HEADERS.map((header) => (
                  <div key={header.name} className="flex items-center gap-2 text-xs">
                    <code className="bg-background px-1.5 py-0.5 rounded font-mono text-[11px]">
                      {header.name}
                    </code>
                    <span className="text-muted-foreground">— {header.description}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                At least one of <code className="bg-background px-1 rounded">first_name</code> or{' '}
                <code className="bg-background px-1 rounded">business_name</code> is required.
                Column names are auto-detected but can be manually mapped.
              </p>
            </div>
          </div>
        )}

        {step === 'map' && parsedCsv && (
          <div className="py-4 space-y-4">
            {/* File info */}
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {parsedCsv.rows.length} rows found
                </p>
              </div>
              <Badge variant="secondary">
                {parsedCsv.headers.length} columns
              </Badge>
            </div>

            {/* Column Mapping */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Column Mapping</Label>

              <div className="grid gap-3">
                <div className="flex items-center gap-3">
                  <Label className="w-28 text-xs">First Name:</Label>
                  <Select
                    value={columnMapping.first_name || '_skip'}
                    onValueChange={(v) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        first_name: v === '_skip' ? '' : v,
                      }))
                    }
                  >
                    <SelectTrigger className="flex-1 h-8">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_skip">— Skip —</SelectItem>
                      {parsedCsv.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="w-28 text-xs">Business Name:</Label>
                  <Select
                    value={columnMapping.business_name || '_skip'}
                    onValueChange={(v) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        business_name: v === '_skip' ? '' : v,
                      }))
                    }
                  >
                    <SelectTrigger className="flex-1 h-8">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_skip">— Skip —</SelectItem>
                      {parsedCsv.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3">
                  <Label className="w-28 text-xs">City:</Label>
                  <Select
                    value={columnMapping.city || '_skip'}
                    onValueChange={(v) =>
                      setColumnMapping((prev) => ({
                        ...prev,
                        city: v === '_skip' ? '' : v,
                      }))
                    }
                  >
                    <SelectTrigger className="flex-1 h-8">
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_skip">— Skip —</SelectItem>
                      {parsedCsv.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {!columnMapping.first_name && !columnMapping.business_name && (
                <div className="flex items-center gap-2 text-amber-600 text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <span>Map at least First Name or Business Name</span>
                </div>
              )}
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Event Type for All</Label>
              <Select
                value={eventType}
                onValueChange={(v) => setEventType(v as SocialProofEventType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Time Display */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time Display</Label>
              <RadioGroup
                value={useTimeOverride ? 'recently' : 'actual'}
                onValueChange={(v) => setUseTimeOverride(v === 'recently')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="recently" id="recently" />
                  <Label htmlFor="recently" className="font-normal text-sm">
                    Show as &quot;recently&quot; (recommended for old data)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="actual" id="actual" />
                  <Label htmlFor="actual" className="font-normal text-sm">
                    Use actual dates (may show &quot;3 months ago&quot;)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Preview */}
            {previewRows && previewRows.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview (first 3)</Label>
                <div className="p-3 bg-muted rounded-lg space-y-2">
                  {previewRows.map((row, i) => (
                    <div key={i} className="text-xs flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>
                        {row.first_name || row.business_name || '—'}
                        {row.city && ` from ${row.city}`} just signed up •{' '}
                        {useTimeOverride ? 'recently' : 'just now'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'upload' && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          {step === 'map' && (
            <>
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={
                  isImporting ||
                  (!columnMapping.first_name && !columnMapping.business_name)
                }
              >
                {isImporting
                  ? 'Importing...'
                  : `Import ${parsedCsv?.rows.length || 0} Events`}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
