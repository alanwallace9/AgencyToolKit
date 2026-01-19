import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/social-proof/capture
 * Public endpoint for embed script to capture form submissions
 *
 * Body:
 * - token: Widget token (sp_xxx)
 * - first_name: Optional
 * - email: Optional (not stored, just used for validation)
 * - phone: Optional (not stored, just used for validation)
 * - business_name: Optional
 */
export async function POST(request: Request) {
  // CORS headers for cross-origin embed script
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();

    if (!body.token) {
      return NextResponse.json(
        { error: 'Missing widget token' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Need at least one identifier
    if (!body.first_name && !body.business_name) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Use admin client for public access
    const supabase = createAdminClient();

    // Get widget by token
    const { data: widget, error: widgetError } = await supabase
      .from('social_proof_widgets')
      .select('id, agency_id, is_active')
      .eq('token', body.token)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Widget not found' },
        { status: 404, headers: corsHeaders }
      );
    }

    // Check if widget is active
    if (!widget.is_active) {
      return NextResponse.json(
        { error: 'Widget is paused' },
        { status: 200, headers: corsHeaders }
      );
    }

    // Get IP address for geolocation
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    const realIp = headersList.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || null;

    // Get city from IP (async, non-blocking)
    let city: string | null = null;
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      city = await getCityFromIP(ip);
    }

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from('social_proof_events')
      .insert({
        agency_id: widget.agency_id,
        widget_id: widget.id,
        event_type: 'signup',
        source: 'auto',
        first_name: body.first_name ? String(body.first_name).trim().split(' ')[0] : null, // Just first name
        business_name: body.business_name ? String(body.business_name).trim() : '',
        city: city || body.city || null, // Use detected city or provided city
        details: {
          captured_at: new Date().toISOString(),
          ip_detected: !!ip,
          has_email: !!body.email,
          has_phone: !!body.phone,
        },
        is_visible: true,
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Error capturing event:', insertError);
      // Don't expose internal errors
      return NextResponse.json(
        { success: false },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, event_id: event?.id },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error capturing social proof event:', error);
    // Always return 200 to not break the form
    return NextResponse.json(
      { success: false },
      { status: 200, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}

/**
 * Get city from IP address using free ip-api.com service
 * Rate limit: 45 requests per minute
 */
async function getCityFromIP(ip: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    if (data.status === 'success' && data.city) {
      return data.city;
    }

    return null;
  } catch (error) {
    // Silently fail - geolocation is optional
    console.error('Geolocation error:', error);
    return null;
  }
}
