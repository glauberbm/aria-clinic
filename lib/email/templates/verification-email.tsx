import React from 'react';

export interface VerificationEmailProps {
  email: string;
  verificationUrl: string;
}

export function VerificationEmail({
  email,
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#f8f9fa', padding: '20px 0' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', margin: '20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ color: '#2563eb', margin: '0 0 10px 0', fontSize: '28px' }}>
              ArIA Clinic
            </h1>
            <p style={{ color: '#666', margin: '0', fontSize: '14px' }}>
              Plataforma de Gestão Clínica Inteligente
            </p>
          </div>

          {/* Main Content */}
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ color: '#333', marginBottom: '20px', fontSize: '20px' }}>
              Bem-vindo à ArIA Clinic!
            </h2>

            <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
              Olá <strong>{email}</strong>,
            </p>

            <p style={{ color: '#555', marginBottom: '15px', lineHeight: '1.6' }}>
              Obrigado por se registrar! Para ativar sua conta, confirme seu endereço de email clicando no botão abaixo.
            </p>

            {/* CTA Button */}
            <div style={{ marginBottom: '25px' }}>
              <a
                href={verificationUrl}
                style={{
                  display: 'inline-block',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  padding: '12px 30px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                Confirmar Email
              </a>
            </div>

            {/* Alternative Link */}
            <p style={{ color: '#888', fontSize: '12px', marginBottom: '15px' }}>
              Ou copie e cole este link no seu navegador:
            </p>
            <p style={{
              color: '#2563eb',
              fontSize: '12px',
              marginBottom: '15px',
              wordBreak: 'break-all',
              padding: '10px',
              backgroundColor: '#f0f4ff',
              borderRadius: '4px'
            }}>
              {verificationUrl}
            </p>

            {/* Important Note */}
            <div style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              padding: '15px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#856404', margin: '0', fontSize: '13px', lineHeight: '1.5' }}>
                <strong>Importante:</strong> Este link expira em 24 horas. Se você não conseguir confirmar sua conta a tempo, poderá fazer um novo registro.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', color: '#888', fontSize: '12px' }}>
            <p style={{ margin: '0 0 10px 0' }}>
              Se você não se registrou em ArIA Clinic, ignore este email.
            </p>
            <p style={{ margin: '0', textAlign: 'center' }}>
              © 2025 ArIA Clinic. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Plain text version for fallback
export function getVerificationEmailText(
  email: string,
  verificationUrl: string
): string {
  return `
Bem-vindo à ArIA Clinic!

Olá ${email},

Obrigado por se registrar! Para ativar sua conta, visite o link abaixo:

${verificationUrl}

Este link expira em 24 horas.

Se você não se registrou em ArIA Clinic, ignore este email.

© 2025 ArIA Clinic. Todos os direitos reservados.
  `.trim();
}
