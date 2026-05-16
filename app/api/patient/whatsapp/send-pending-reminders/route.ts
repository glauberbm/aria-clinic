/**
 * API Route: Send Pending WhatsApp Appointment Reminders
 * GET /api/patient/whatsapp/send-pending-reminders
 *
 * Background job endpoint to send appointment reminders
 * Scheduled to run every hour via cron service (GitHub Actions, AWS Lambda, etc)
 *
 * Sends:
 * - 24h reminders for appointments 24 hours away
 * - 1h reminders for appointments 1 hour away
 *
 * Access: Requires CRON_SECRET in Authorization header
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;
const requestCounts: Record<string, number[]> = {};

/**
 * Simple rate limiter
 */
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  // Initialize or clean up old requests
  if (!requestCounts[clientId]) {
    requestCounts[clientId] = [];
  }

  // Remove requests outside the window
  requestCounts[clientId] = requestCounts[clientId].filter((timestamp) => timestamp > windowStart);

  // Check if limit exceeded
  if (requestCounts[clientId].length >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  // Add current request
  requestCounts[clientId].push(now);
  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Verify CRON_SECRET header
    const cronSecret = request.headers.get('Authorization')?.replace('Bearer ', '');
    const expectedSecret = process.env.CRON_SECRET;

    if (!expectedSecret || cronSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit check
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded', message: 'Too many requests' },
        { status: 429 }
      );
    }

    const now = new Date();
    const results = {
      24h_reminders_sent: 0,
      1h_reminders_sent: 0,
      errors: [] as string[],
      duration_ms: 0,
    };

    const startTime = Date.now();

    // Calculate time windows
    const twentyFourHourLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    // Query: Find appointments needing 24h reminder (appointment is ~24h away)
    const { data: appointments24h, error: error24h } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'scheduled')
      .eq('reminder_sent_24h', false)
      .gt('appointment_date', new Date(now.getTime() + 23.5 * 60 * 60 * 1000).toISOString())
      .lt('appointment_date', twentyFourHourLater.toISOString());

    if (error24h) {
      results.errors.push(`Failed to fetch 24h appointments: ${error24h.message}`);
    }

    // Send 24h reminders
    if (appointments24h) {
      for (const appointment of appointments24h) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/patient/whatsapp/send-reminder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({
              appointmentId: appointment.id,
              reminderType: '24h',
            }),
          });

          if (response.ok) {
            results['24h_reminders_sent']++;
          } else {
            const errorData = await response.json();
            results.errors.push(
              `Failed to send 24h reminder for appointment ${appointment.id}: ${errorData.error}`
            );
          }
        } catch (error) {
          results.errors.push(
            `Exception sending 24h reminder for ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown'}`
          );
        }
      }
    }

    // Query: Find appointments needing 1h reminder (appointment is ~1h away)
    const { data: appointments1h, error: error1h } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'scheduled')
      .eq('reminder_sent_1h', false)
      .gt('appointment_date', new Date(now.getTime() + 50 * 60 * 1000).toISOString()) // 50 minutes
      .lt('appointment_date', oneHourLater.toISOString());

    if (error1h) {
      results.errors.push(`Failed to fetch 1h appointments: ${error1h.message}`);
    }

    // Send 1h reminders
    if (appointments1h) {
      for (const appointment of appointments1h) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/patient/whatsapp/send-reminder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.CRON_SECRET}`,
            },
            body: JSON.stringify({
              appointmentId: appointment.id,
              reminderType: '1h',
            }),
          });

          if (response.ok) {
            results['1h_reminders_sent']++;
          } else {
            const errorData = await response.json();
            results.errors.push(
              `Failed to send 1h reminder for appointment ${appointment.id}: ${errorData.error}`
            );
          }
        } catch (error) {
          results.errors.push(
            `Exception sending 1h reminder for ${appointment.id}: ${error instanceof Error ? error.message : 'Unknown'}`
          );
        }
      }
    }

    results.duration_ms = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        message: 'Appointment reminders scheduled',
        ...results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-pending-reminders:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler for manual trigger (for testing or admin use)
 */
export async function POST(request: NextRequest) {
  // Same auth check as GET
  const cronSecret = request.headers.get('Authorization')?.replace('Bearer ', '');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret || cronSecret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Delegate to GET handler
  return GET(request);
}
