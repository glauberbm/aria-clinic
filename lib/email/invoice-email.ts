import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface InvoiceEmailData {
  patientEmail: string;
  patientName: string;
  clinicName: string;
  invoiceNumber: string;
  amountBRL: string;
  pdfUrl?: string;
  invoiceId: string;
}

/**
 * Send invoice via email using Resend API
 * P95 latency target: < 3 seconds
 */
export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const htmlContent = generateInvoiceEmailHTML(data);

    const response = await resend.emails.send({
      from: `${data.clinicName} <noreply@aria-clinic.com>`,
      to: data.patientEmail,
      subject: `Sua Nota Fiscal nº ${data.invoiceNumber} - ${data.clinicName}`,
      html: htmlContent,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    console.error('Error sending invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send invoice resend notification (when manual retry is triggered)
 */
export async function sendInvoiceResendEmail(data: InvoiceEmailData): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const htmlContent = generateInvoiceResendEmailHTML(data);

    const response = await resend.emails.send({
      from: `${data.clinicName} <noreply@aria-clinic.com>`,
      to: data.patientEmail,
      subject: `Reenviando: Sua Nota Fiscal nº ${data.invoiceNumber} - ${data.clinicName}`,
      html: htmlContent,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    console.error('Error sending invoice resend email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send email when PDF generation fails (orphaned invoice)
 */
export async function sendOrphanedInvoiceEmail(
  data: InvoiceEmailData & { dashboardLink: string }
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    const htmlContent = generateOrphanedInvoiceEmailHTML(data);

    const response = await resend.emails.send({
      from: `${data.clinicName} <noreply@aria-clinic.com>`,
      to: data.patientEmail,
      subject: `Sua Nota Fiscal nº ${data.invoiceNumber} está pronta - ${data.clinicName}`,
      html: htmlContent,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message,
      };
    }

    return {
      success: true,
      messageId: response.data?.id,
    };
  } catch (error) {
    console.error('Error sending orphaned invoice email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function generateInvoiceEmailHTML(data: InvoiceEmailData): string {
  const downloadLink = data.pdfUrl
    ? `<a href="${data.pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">Baixar Nota Fiscal (PDF)</a>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nota Fiscal</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          padding: 40px 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .invoice-title {
          font-size: 16px;
          color: #666;
          margin-top: 10px;
        }
        .greeting {
          font-size: 14px;
          color: #666;
          margin: 20px 0;
        }
        .info-box {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
          border-bottom: 1px solid #eee;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: bold;
          color: #333;
        }
        .value {
          color: #666;
        }
        .total-amount {
          font-size: 20px;
          font-weight: bold;
          color: #007bff;
          text-align: right;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 2px solid #007bff;
        }
        .action-button {
          display: block;
          text-align: center;
          margin-top: 20px;
        }
        .action-button a {
          display: inline-block;
          padding: 12px 24px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .action-button a:hover {
          background-color: #0056b3;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="clinic-name">${data.clinicName}</div>
          <div class="invoice-title">Nota Fiscal de Serviço</div>
        </div>

        <div class="greeting">
          <p>Olá <strong>${data.patientName}</strong>,</p>
          <p>Sua nota fiscal foi gerada e está pronta para download. Clique no botão abaixo para acessá-la.</p>
        </div>

        <div class="info-box">
          <div class="info-row">
            <span class="label">Número da Nota:</span>
            <span class="value">${data.invoiceNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Valor Total:</span>
            <span class="value">${data.amountBRL}</span>
          </div>
          <div class="info-row">
            <span class="label">Clínica:</span>
            <span class="value">${data.clinicName}</span>
          </div>
        </div>

        ${downloadLink}

        <div class="footer">
          <p>Esta é uma mensagem automática. Não responda este e-mail.</p>
          <p>Se tiver dúvidas, entre em contato conosco através da plataforma.</p>
          <p>&copy; ${new Date().getFullYear()} ${data.clinicName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateInvoiceResendEmailHTML(data: InvoiceEmailData): string {
  const downloadLink = data.pdfUrl
    ? `<a href="${data.pdfUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; margin-top: 20px;">Baixar Nota Fiscal (PDF)</a>`
    : '';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nota Fiscal Reenviada</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          padding: 40px 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #ffc107;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .invoice-title {
          font-size: 16px;
          color: #666;
          margin-top: 10px;
        }
        .greeting {
          font-size: 14px;
          color: #666;
          margin: 20px 0;
        }
        .info-box {
          background-color: #fffbea;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
          border-left: 4px solid #ffc107;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .label {
          font-weight: bold;
          color: #333;
        }
        .value {
          color: #666;
        }
        .action-button {
          display: block;
          text-align: center;
          margin-top: 20px;
        }
        .action-button a {
          display: inline-block;
          padding: 12px 24px;
          background-color: #ffc107;
          color: #333;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .action-button a:hover {
          background-color: #e0a800;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="clinic-name">${data.clinicName}</div>
          <div class="invoice-title">Nota Fiscal Reenviada</div>
        </div>

        <div class="greeting">
          <p>Olá <strong>${data.patientName}</strong>,</p>
          <p>Estamos reenviando sua nota fiscal solicitada. Clique no botão abaixo para fazer o download.</p>
        </div>

        <div class="info-box">
          <div class="info-row">
            <span class="label">Número da Nota:</span>
            <span class="value">${data.invoiceNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Valor Total:</span>
            <span class="value">${data.amountBRL}</span>
          </div>
        </div>

        ${downloadLink}

        <div class="footer">
          <p>Esta é uma mensagem automática. Não responda este e-mail.</p>
          <p>&copy; ${new Date().getFullYear()} ${data.clinicName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateOrphanedInvoiceEmailHTML(
  data: InvoiceEmailData & { dashboardLink: string }
): string {
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nota Fiscal Disponível</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          padding: 40px 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #28a745;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 5px;
        }
        .greeting {
          font-size: 14px;
          color: #666;
          margin: 20px 0;
        }
        .info-box {
          background-color: #f0f8f4;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
          border-left: 4px solid #28a745;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .label {
          font-weight: bold;
          color: #333;
        }
        .value {
          color: #666;
        }
        .action-button {
          display: block;
          text-align: center;
          margin-top: 20px;
        }
        .action-button a {
          display: inline-block;
          padding: 12px 24px;
          background-color: #28a745;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
        }
        .action-button a:hover {
          background-color: #218838;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 12px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="clinic-name">${data.clinicName}</div>
          <div style="font-size: 14px; color: #666; margin-top: 10px;">Nota Fiscal Disponível</div>
        </div>

        <div class="greeting">
          <p>Olá <strong>${data.patientName}</strong>,</p>
          <p>Sua nota fiscal nº <strong>${data.invoiceNumber}</strong> já está disponível.</p>
          <p>Acesse sua conta para visualizar e fazer o download da nota fiscal.</p>
        </div>

        <div class="info-box">
          <div class="info-row">
            <span class="label">Número da Nota:</span>
            <span class="value">${data.invoiceNumber}</span>
          </div>
          <div class="info-row">
            <span class="label">Valor Total:</span>
            <span class="value">${data.amountBRL}</span>
          </div>
        </div>

        <div class="action-button">
          <a href="${data.dashboardLink}">Acessar Minha Conta</a>
        </div>

        <div class="footer">
          <p>Esta é uma mensagem automática. Não responda este e-mail.</p>
          <p>&copy; ${new Date().getFullYear()} ${data.clinicName}. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
