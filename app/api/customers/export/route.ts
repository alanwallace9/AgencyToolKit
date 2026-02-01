import { NextResponse } from 'next/server';
import { getCurrentAgency } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const agency = await getCurrentAgency();
    if (!agency) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Fetch all customers for this agency
    const { data: customers, error } = await supabase
      .from('customers')
      .select('name, token, ghl_location_id, gbp_place_id, is_active, created_at')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch customers' },
        { status: 500 }
      );
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { error: 'No customers to export' },
        { status: 404 }
      );
    }

    // Create CSV content
    const headers = [
      'Name',
      'Token',
      'GHL Location ID',
      'GBP Place ID',
      'Active',
      'Created Date',
    ];

    const csvRows = [
      headers.join(','),
      ...customers.map((customer) => {
        const row = [
          escapeCSV(customer.name || ''),
          escapeCSV(customer.token || ''),
          escapeCSV(customer.ghl_location_id || ''),
          escapeCSV(customer.gbp_place_id || ''),
          customer.is_active ? 'Yes' : 'No',
          customer.created_at
            ? new Date(customer.created_at).toLocaleDateString()
            : '',
        ];
        return row.join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');
    const filename = `customers-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to escape CSV values
function escapeCSV(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
