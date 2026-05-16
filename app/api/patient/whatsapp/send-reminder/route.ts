/**
 * API Route: Send WhatsApp Appointment Reminder
 * POST /api/patient/whatsapp/send-reminder
 *
 * Sends appointment reminder notifications via WhatsApp
 * Called by scheduler or manually triggered by clinic staff
 *
 * Access: Clinic staff with manage_appointments permission (via service role)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createWhatsAppService } from '@/lib/whatsapp/service';

// Use service role key for backend operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appointmentId, reminderType = '24h', patientId } = body;

    if (!appointmentId && !patientId) {
      return NextResponse.json({ error: 'Missing appointmentId or patientId' }, { status: 400 });
    }

    // Fetch appointment details
    let appointment;
    if (appointmentId) {
      const { data, error } = await supabase
        .from('appointments')
        .select(
          `
          id, patient_id, clinic_id, appointment_date, title,
          provider_name, location, reminder_sent_24h, reminder_sent_1h
        `
        )
        .eq('id', appointmentId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      appointment = data;
    } else {
      // Find upcoming appointment for patient
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'scheduled')
        .gt('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(1)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'No upcoming appointment found' }, { status: 404 });
      }
      appointment = data;
    }

    // Fetch patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, name, phone, email, preferred_contact_method, whatsapp_enabled')
      .eq('id', appointment.patient_id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if patient has WhatsApp enabled
    if (!patient.whatsapp_enabled) {
      return NextResponse.json(
        { message: 'Patient has WhatsApp disabled', skipped: true },
        { status: 200 }
      );
    }

    // Format appointment time for display
    const appointmentDate = new Date(appointment.appointment_date);
    const appointmentTime = appointmentDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const appointmentDateStr = appointmentDate.toLocaleDateString('pt-BR');

    // Prepare message template variables
    const templateType = reminderType === '24h' ? 'appointment_reminder_24h' : 'appointment_reminder_1h';
    const variables = {
      patientName: patient.name,
      appointmentTime,
      appointmentDate: appointmentDateStr,
      providerName: appointment.provider_name || 'Dr(a)',
      appointmentLocation: appointment.location || 'Clínica',
    };

    // Send WhatsApp message
    const whatsappService = createWhatsAppService();
    const result = await whatsappService.sendMessage({
      patientId: patient.id,
      clinicId: appointment.clinic_id,
      phoneNumber: patient.phone,
      templateType: templateType as any,
      variables,
      messageType: 'appointment_reminder',
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Failed to send reminder',
          details: result.error,
        },
        { status: 500 }
      );
    }

    // Update reminder tracking in appointment
    const reminderField = reminderType === '24h' ? 'reminder_sent_24h' : 'reminder_sent_1h';
    await supabase
      .from('appointments')
      .update({
        [reminderField]: true,
        reminder_sent_at: new Date().toISOString(),
      })
      .eq('id', appointment.id);

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      patientName: patient.name,
      appointmentTime,
      reminderType,
    });
  } catch (error) {
    console.error('Error sending appointment reminder:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
