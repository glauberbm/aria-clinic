// Mock environment variables and Supabase BEFORE importing generator
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(),
  })),
}));

jest.mock('@/lib/invoice/numbering', () => ({
  generateInvoiceNumber: jest.fn(() => '2026-05-00001'),
}));

import { generateInvoiceHTML } from '@/lib/invoice/generator';

describe('Invoice Generator', () => {
  describe('generateInvoiceHTML', () => {
    it('should generate valid HTML with clinic and patient data', () => {
      const data = {
        clinicId: 'clinic-123',
        appointmentId: 'appt-456',
        patientId: 'patient-789',
        paymentId: 'payment-000',
        amountCents: 25000, // R$ 250.00
        currency: 'BRL',
        clinicName: 'Clínica Demo',
        clinicCNPJ: '12.345.678/0001-90',
        patientName: 'João Silva',
        patientCPF: '123.456.789-00',
        appointmentDate: '2026-05-17T14:00:00Z',
        appointmentService: 'Consulta Geral',
      };

      const html = generateInvoiceHTML(data);

      expect(html).toContain('Clínica Demo');
      expect(html).toContain('João Silva');
      expect(html).toContain('123.456.789-00');
      expect(html).toMatch(/R\$\s+250,00/);
      expect(html).toContain('NOTA FISCAL DE SERVIÇO');
      expect(html).toContain('Consulta Geral');
      expect(html).toContain('pt-BR');
    });

    it('should render Portuguese special characters correctly', () => {
      const data = {
        clinicId: 'clinic-123',
        appointmentId: 'appt-456',
        patientId: 'patient-789',
        paymentId: 'payment-000',
        amountCents: 15000,
        currency: 'BRL',
        clinicName: 'Clínica São José',
        clinicCNPJ: '12.345.678/0001-90',
        patientName: 'José Pereira',
        patientCPF: '123.456.789-00',
        appointmentDate: '2026-05-17T14:00:00Z',
        appointmentService: 'Avaliação Clínica',
      };

      const html = generateInvoiceHTML(data);

      expect(html).toContain('São José');
      expect(html).toContain('José Pereira');
      expect(html).toContain('Avaliação Clínica');
    });

    it('should format currency correctly in BRL', () => {
      const data = {
        clinicId: 'clinic-123',
        appointmentId: 'appt-456',
        patientId: 'patient-789',
        paymentId: 'payment-000',
        amountCents: 123456, // R$ 1.234,56
        currency: 'BRL',
        clinicName: 'Clínica Demo',
        clinicCNPJ: '12.345.678/0001-90',
        patientName: 'João Silva',
        patientCPF: '123.456.789-00',
        appointmentDate: '2026-05-17T14:00:00Z',
        appointmentService: 'Consulta',
      };

      const html = generateInvoiceHTML(data);

      expect(html).toMatch(/R\$\s+1[.,]234,56/);
    });

    it('should include valid HTML structure', () => {
      const data = {
        clinicId: 'clinic-123',
        appointmentId: 'appt-456',
        patientId: 'patient-789',
        paymentId: 'payment-000',
        amountCents: 25000,
        currency: 'BRL',
        clinicName: 'Clínica Demo',
        clinicCNPJ: '12.345.678/0001-90',
        patientName: 'João Silva',
        patientCPF: '123.456.789-00',
        appointmentDate: '2026-05-17T14:00:00Z',
        appointmentService: 'Consulta Geral',
      };

      const html = generateInvoiceHTML(data);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('</html>');
      expect(html).toContain('<style>');
      expect(html).toContain('</style>');
    });

    it('should handle minimum amount correctly', () => {
      const data = {
        clinicId: 'clinic-123',
        appointmentId: 'appt-456',
        patientId: 'patient-789',
        paymentId: 'payment-000',
        amountCents: 100, // R$ 1,00
        currency: 'BRL',
        clinicName: 'Clínica Demo',
        clinicCNPJ: '12.345.678/0001-90',
        patientName: 'João Silva',
        patientCPF: '123.456.789-00',
        appointmentDate: '2026-05-17T14:00:00Z',
        appointmentService: 'Consulta',
      };

      const html = generateInvoiceHTML(data);

      expect(html).toMatch(/R\$\s+1,00/); // Allow flexible whitespace
    });
  });
});
