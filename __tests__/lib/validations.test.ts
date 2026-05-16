import { appointmentFormSchema } from '@/lib/validations/appointment';
import { waitlistFormSchema } from '@/lib/validations/waitlist';

describe('Phone Number Validation', () => {
  describe('appointmentFormSchema', () => {
    it('should accept valid Brazilian phone numbers', () => {
      const validPhones = [
        '+5585987654321',  // 11 digits after +55
        '+558133334444',   // 10 digits after +55
        '+551133334444',   // São Paulo landline (10 digits)
      ];

      for (const phone of validPhones) {
        const result = appointmentFormSchema.safeParse({
          patientName: 'João Silva',
          patientPhone: phone,
          doctorId: '123e4567-e89b-12d3-a456-426614174000',
          date: new Date('2026-06-01'),
          timeStart: '14:30',
          duration: '30',
          type: 'consultation',
          notes: '',
        });

        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '5585987654321', // Missing +
        '+558598765432', // Exactly 10 digits (minimum valid) - this is actually valid!
        '+558598765432100', // Too long (12 digits after +55)
        'invalid-phone',
        '+1-555-123-4567', // US format
        '555 123 4567',
      ];

      for (const phone of invalidPhones) {
        // Some of these are actually valid, so we'll be more selective
        if (phone === '+558598765432') {
          // This actually matches the regex because it has exactly 10 digits after +55
          const result = appointmentFormSchema.safeParse({
            patientName: 'João Silva',
            patientPhone: phone,
            doctorId: '123e4567-e89b-12d3-a456-426614174000',
            date: new Date('2026-06-01'),
            timeStart: '14:30',
            duration: '30',
            type: 'consultation',
            notes: '',
          });
          expect(result.success).toBe(true);
        } else {
          // These should be invalid
          const result = appointmentFormSchema.safeParse({
            patientName: 'João Silva',
            patientPhone: phone,
            doctorId: '123e4567-e89b-12d3-a456-426614174000',
            date: new Date('2026-06-01'),
            timeStart: '14:30',
            duration: '30',
            type: 'consultation',
            notes: '',
          });
          expect(result.success).toBe(false);
        }
      }
    });

    it('should allow undefined phone number (optional field)', () => {
      const result = appointmentFormSchema.safeParse({
        patientName: 'João Silva',
        patientPhone: undefined,
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date('2026-06-01'),
        timeStart: '14:30',
        duration: '30',
        type: 'consultation',
        notes: '',
      });

      expect(result.success).toBe(true);
    });

    it('should provide helpful error message for invalid format', () => {
      const result = appointmentFormSchema.safeParse({
        patientName: 'João Silva',
        patientPhone: '123456789',
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date('2026-06-01'),
        timeStart: '14:30',
        duration: '30',
        type: 'consultation',
        notes: '',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Brazilian phone number');
      }
    });
  });

  describe('waitlistFormSchema', () => {
    it('should accept valid Brazilian phone numbers', () => {
      const validPhones = ['+5585987654321', '+558133334444'];

      for (const phone of validPhones) {
        const result = waitlistFormSchema.safeParse({
          patientName: 'Maria Santos',
          patientPhone: phone,
        });

        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid phone formats', () => {
      const invalidPhones = [
        '5585987654321', // Missing +
        '+558598765432XX', // Contains letters
        'invalid',
        '+1234567890', // Not Brazilian format
      ];

      for (const phone of invalidPhones) {
        const result = waitlistFormSchema.safeParse({
          patientName: 'Maria Santos',
          patientPhone: phone,
        });

        expect(result.success).toBe(false);
      }
    });
  });

  describe('Edge cases', () => {
    it('should allow empty string phone (treated as optional)', () => {
      // Empty strings are allowed by the refine logic: (phone) => !phone || /.../.test(phone)
      const result = appointmentFormSchema.safeParse({
        patientName: 'João Silva',
        patientPhone: '',
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date('2026-06-01'),
        timeStart: '14:30',
        duration: '30',
        type: 'consultation',
        notes: '',
      });

      expect(result.success).toBe(true);
    });

    it('should accept minimum length Brazilian phone (12 digits with +55)', () => {
      const minPhone = '+558133334444'; // 12 digits total
      const result = appointmentFormSchema.safeParse({
        patientName: 'João Silva',
        patientPhone: minPhone,
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date('2026-06-01'),
        timeStart: '14:30',
        duration: '30',
        type: 'consultation',
        notes: '',
      });

      expect(result.success).toBe(true);
    });

    it('should accept maximum length Brazilian phone (13 digits with +55)', () => {
      const maxPhone = '+5585987654321'; // 13 digits total
      const result = appointmentFormSchema.safeParse({
        patientName: 'João Silva',
        patientPhone: maxPhone,
        doctorId: '123e4567-e89b-12d3-a456-426614174000',
        date: new Date('2026-06-01'),
        timeStart: '14:30',
        duration: '30',
        type: 'consultation',
        notes: '',
      });

      expect(result.success).toBe(true);
    });
  });
});
