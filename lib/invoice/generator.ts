import { createClient } from '@supabase/supabase-js';
import { generateInvoiceNumber } from './numbering';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface InvoiceData {
  clinicId: string;
  appointmentId: string;
  patientId: string;
  paymentId: string;
  amountCents: number;
  currency: string;
  clinicName: string;
  clinicCNPJ: string;
  patientName: string;
  patientCPF: string;
  appointmentDate: string;
  appointmentService: string;
}

/**
 * Generate invoice HTML template
 */
export function generateInvoiceHTML(data: InvoiceData): string {
  const amountBRL = (data.amountCents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const appointmentDate = new Date(data.appointmentDate).toLocaleDateString(
    'pt-BR'
  );

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nota Fiscal</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 20px;
        }
        .clinic-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .clinic-cnpj {
          font-size: 14px;
          color: #666;
        }
        .invoice-title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 15px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-weight: bold;
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          font-size: 13px;
        }
        .label {
          font-weight: bold;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        .details-table th {
          background-color: #f5f5f5;
          padding: 10px;
          text-align: left;
          font-weight: bold;
          font-size: 12px;
        }
        .details-table td {
          padding: 10px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .total-section {
          text-align: right;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #333;
        }
        .total-amount {
          font-size: 18px;
          font-weight: bold;
          color: #333;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 11px;
          color: #999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="clinic-name">${data.clinicName}</div>
          <div class="clinic-cnpj">CNPJ: ${data.clinicCNPJ}</div>
          <div class="invoice-title">NOTA FISCAL DE SERVIÇO</div>
        </div>

        <div class="section">
          <div class="section-title">Dados do Paciente</div>
          <div class="info-row">
            <span><span class="label">Nome:</span> ${data.patientName}</span>
            <span><span class="label">CPF:</span> ${data.patientCPF}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Detalhes da Consulta</div>
          <table class="details-table">
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Data</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${data.appointmentService}</td>
                <td>${appointmentDate}</td>
                <td>${amountBRL}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div>Valor Total: <span class="total-amount">${amountBRL}</span></div>
        </div>

        <div class="footer">
          <p>Esta é uma nota fiscal eletrônica gerada automaticamente.</p>
          <p>Data: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString(
    'pt-BR'
  )}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Create invoice record in database
 */
export async function createInvoiceRecord(
  clinicId: string,
  appointmentId: string,
  patientId: string,
  paymentId: string,
  amountCents: number,
  currency: string,
  pdfUrl?: string
) {
  const invoiceNumber = await generateInvoiceNumber(clinicId);

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      clinic_id: clinicId,
      appointment_id: appointmentId,
      patient_id: patientId,
      payment_id: paymentId,
      invoice_number: invoiceNumber,
      amount_cents: amountCents,
      currency,
      pdf_url: pdfUrl || null,
      email_status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating invoice record:', error);
    throw error;
  }

  return invoice;
}

/**
 * Update invoice email status
 */
export async function updateInvoiceEmailStatus(
  invoiceId: string,
  status: 'pending' | 'sent' | 'failed' | 'bounced'
) {
  const { error } = await supabase
    .from('invoices')
    .update({
      email_status: status,
      email_sent_at: status === 'sent' ? new Date().toISOString() : null,
    })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error updating invoice email status:', error);
    throw error;
  }
}

/**
 * Increment invoice email failure count
 */
export async function incrementEmailFailureCount(invoiceId: string) {
  const { data: current } = await supabase
    .from('invoices')
    .select('email_failed_count')
    .eq('id', invoiceId)
    .single();

  const newCount = (current?.email_failed_count || 0) + 1;

  const { error } = await supabase
    .from('invoices')
    .update({ email_failed_count: newCount })
    .eq('id', invoiceId);

  if (error) {
    console.error('Error incrementing failure count:', error);
    throw error;
  }

  return newCount;
}
