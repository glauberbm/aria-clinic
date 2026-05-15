import { Resend } from 'resend';
import { VerificationEmail, getVerificationEmailText } from '@/lib/email/templates/verification-email';

// Initialize Resend with API key (lazy initialization to avoid build-time errors)
let resend: Resend | null = null;

function getResendClient() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

export interface SendVerificationEmailOptions {
  email: string;
  verificationToken: string;
  baseUrl?: string;
}

/**
 * Sends a verification email to the user
 * @param options Email sending options
 * @returns Promise with the email send result
 */
export async function sendVerificationEmail({
  email,
  verificationToken,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}: SendVerificationEmailOptions) {
  try {
    // Build verification URL
    const verificationUrl = `${baseUrl}/auth/verify?token=${verificationToken}&email=${encodeURIComponent(email)}`;

    const resendClient = getResendClient();
    if (!resendClient) {
      throw new Error('Email service not configured. Set RESEND_API_KEY environment variable.');
    }

    // Send email using Resend
    const result = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@aria-clinic.com',
      to: email,
      subject: 'Confirme seu email - ArIA Clinic',
      react: VerificationEmail({
        email,
        verificationUrl,
      }),
      text: getVerificationEmailText(email, verificationUrl),
    });

    // Check for errors
    if (result.error) {
      console.error('[Email Service] Error sending verification email:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    console.log('[Email Service] Verification email sent successfully', {
      email,
      messageId: result.data?.id,
    });

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('[Email Service] Exception sending verification email:', error);
    throw error;
  }
}

/**
 * Sends a password reset email to the user
 * @param email User email address
 * @param resetToken Password reset token
 * @param baseUrl Application base URL for building the reset link
 * @returns Promise with the email send result
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
) {
  try {
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const resendClient = getResendClient();
    if (!resendClient) {
      throw new Error('Email service not configured. Set RESEND_API_KEY environment variable.');
    }

    const result = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@aria-clinic.com',
      to: email,
      subject: 'Redefina sua senha - ArIA Clinic',
      text: `
Clique no link abaixo para redefinir sua senha:
${resetUrl}

Este link expira em 1 hora.
      `.trim(),
    });

    if (result.error) {
      console.error('[Email Service] Error sending password reset email:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('[Email Service] Exception sending password reset email:', error);
    throw error;
  }
}

/**
 * Sends a welcome email after successful registration
 * @param email User email address
 * @param fullName User full name
 * @param baseUrl Application base URL
 * @returns Promise with the email send result
 */
export async function sendWelcomeEmail(
  email: string,
  fullName: string
) {
  try {
    const resendClient = getResendClient();
    if (!resendClient) {
      throw new Error('Email service not configured. Set RESEND_API_KEY environment variable.');
    }

    const result = await resendClient.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@aria-clinic.com',
      to: email,
      subject: 'Bem-vindo à ArIA Clinic!',
      text: `
Olá ${fullName},

Bem-vindo à ArIA Clinic! Sua conta foi criada com sucesso.

Explore nossa plataforma e configure suas preferências.

ArIA Clinic - Plataforma de Gestão Clínica Inteligente
      `.trim(),
    });

    if (result.error) {
      console.error('[Email Service] Error sending welcome email:', result.error);
      throw new Error(`Failed to send email: ${result.error.message}`);
    }

    return {
      success: true,
      messageId: result.data?.id,
    };
  } catch (error) {
    console.error('[Email Service] Exception sending welcome email:', error);
    throw error;
  }
}
