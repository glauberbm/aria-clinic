// Using Jest globals - no need for explicit imports
import {
  validateCPF,
  validateCNPJ,
  formatCPF,
  formatCNPJ,
} from '@/lib/validate/cpf-cnpj';

describe('CPF and CNPJ Validation', () => {
  describe('validateCPF', () => {
    it('should validate valid CPF', () => {
      // Valid CPF (generated with correct check digits)
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('11144477735')).toBe(true); // without formatting
    });

    it('should reject CPF with all same digits', () => {
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('000.000.000-00')).toBe(false);
      expect(validateCPF('999.999.999-99')).toBe(false);
    });

    it('should reject CPF with wrong length', () => {
      expect(validateCPF('111.444.777')).toBe(false);
      expect(validateCPF('111.444.777-3')).toBe(false);
      expect(validateCPF('111.444.777-355')).toBe(false);
    });

    it('should reject CPF with invalid check digits', () => {
      expect(validateCPF('111.444.777-36')).toBe(false);
      expect(validateCPF('111.444.777-34')).toBe(false);
      expect(validateCPF('123.456.789-10')).toBe(false);
    });

    it('should handle various formatting', () => {
      const validCPF = '111.444.777-35';
      expect(validateCPF(validCPF)).toBe(true);
      expect(validateCPF('11144477735')).toBe(true);
      expect(validateCPF('111 444 777 35')).toBe(true);
    });

    it('should reject non-numeric input after cleaning', () => {
      expect(validateCPF('abc.def.ghi-jk')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    it('should validate valid CNPJ', () => {
      // Valid CNPJ (generated with correct check digits)
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCNPJ('11222333000181')).toBe(true); // without formatting
    });

    it('should reject CNPJ with all same digits', () => {
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validateCNPJ('00.000.000/0000-00')).toBe(false);
      expect(validateCNPJ('99.999.999/9999-99')).toBe(false);
    });

    it('should reject CNPJ with wrong length', () => {
      expect(validateCNPJ('11.222.333/0001')).toBe(false);
      expect(validateCNPJ('11.222.333/0001-8')).toBe(false);
      expect(validateCNPJ('11.222.333/0001-811')).toBe(false);
    });

    it('should reject CNPJ with invalid check digits', () => {
      expect(validateCNPJ('11.222.333/0001-82')).toBe(false);
      expect(validateCNPJ('11.222.333/0001-80')).toBe(false);
      expect(validateCNPJ('12.345.678/0001-90')).toBe(false);
    });

    it('should handle various formatting', () => {
      const validCNPJ = '11.222.333/0001-81';
      expect(validateCNPJ(validCNPJ)).toBe(true);
      expect(validateCNPJ('11222333000181')).toBe(true);
      expect(validateCNPJ('11 222 333 0001 81')).toBe(true);
    });
  });

  describe('formatCPF', () => {
    it('should format CPF correctly', () => {
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
      expect(formatCPF('111.444.777-35')).toBe('111.444.777-35'); // already formatted
    });

    it('should handle CPF with spaces', () => {
      expect(formatCPF('111 444 777 35')).toBe('111.444.777-35');
    });

    it('should clean non-numeric characters', () => {
      expect(formatCPF('111-444-777-35')).toBe('111.444.777-35');
      expect(formatCPF('111 444 777-35')).toBe('111.444.777-35');
    });
  });

  describe('formatCNPJ', () => {
    it('should format CNPJ correctly', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
      expect(formatCNPJ('11.222.333/0001-81')).toBe('11.222.333/0001-81'); // already formatted
    });

    it('should handle CNPJ with spaces', () => {
      expect(formatCNPJ('11 222 333 0001 81')).toBe('11.222.333/0001-81');
    });

    it('should clean non-numeric characters', () => {
      expect(formatCNPJ('11-222-333-0001-81')).toBe('11.222.333/0001-81');
    });
  });
});
