/**
 * CPF and CNPJ validation for Brazil
 */

/**
 * Validate CPF (Cadastro de Pessoas Físicas)
 * Format: XXX.XXX.XXX-XX
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false; // All same digits

  // First check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[9]) !== digit1) return false;

  // Second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[10]) !== digit2) return false;

  return true;
}

/**
 * Validate CNPJ (Cadastro Nacional da Pessoa Jurídica)
 * Format: XX.XXX.XXX/XXXX-XX
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');

  if (cleaned.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cleaned)) return false; // All same digits

  // First check digit
  let sum = 0;
  const multiplier1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * multiplier1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[12]) !== digit1) return false;

  // Second check digit
  sum = 0;
  const multiplier2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * multiplier2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleaned[13]) !== digit2) return false;

  return true;
}

/**
 * Format CPF for display: XXX.XXX.XXX-XX
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Format CNPJ for display: XX.XXX.XXX/XXXX-XX
 */
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}
