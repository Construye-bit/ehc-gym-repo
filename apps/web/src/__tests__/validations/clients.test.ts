import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { clientSchema } from '@/lib/validations/clients';

describe('Client Validations', () => {
  it('debe validar datos de cliente válidos', () => {
    const validData = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-01',
    };

    expect(() => clientSchema.parse(validData)).not.toThrow();
  });

  it('debe validar cliente con endDate', () => {
    const validData = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-01',
      endDate: '2024-12-31',
    };

    expect(() => clientSchema.parse(validData)).not.toThrow();
  });

  it('debe rechazar nombre vacío', () => {
    const invalidData = {
      personName: '',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-01',
    };

    expect(() => clientSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('debe rechazar email inválido', () => {
    const invalidData = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'invalid-email',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-01',
    };

    expect(() => clientSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('debe rechazar número de documento vacío', () => {
    const invalidData = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-01',
    };

    expect(() => clientSchema.parse(invalidData)).toThrow(z.ZodError);
  });

  it('debe validar status ACTIVE', () => {
    const validData = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-01',
    };

    expect(() => clientSchema.parse(validData)).not.toThrow();
  });

  it('debe validar status INACTIVE', () => {
    const validData = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'INACTIVE' as const,
      isPaymentActive: false,
      joinDate: '2024-01-01',
    };

    expect(() => clientSchema.parse(validData)).not.toThrow();
  });

  it('debe validar diferentes tipos de documento', () => {
    const documentTypes = ['CC', 'CE', 'TI', 'PASSPORT'] as const;

    documentTypes.forEach((docType) => {
      const data = {
        personName: 'Jane',
        personLastName: 'Doe',
        personDocumentType: docType,
        personDocumentNumber: '1234567890',
        personPhone: '+1234567890',
        email: 'jane@example.com',
        status: 'ACTIVE' as const,
        isPaymentActive: true,
        joinDate: '2024-01-01',
      };
      expect(() => clientSchema.parse(data)).not.toThrow();
    });
  });

  it('debe validar isPaymentActive como boolean', () => {
    const dataTrue = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-01',
    };

    const dataFalse = {
      ...dataTrue,
      isPaymentActive: false,
    };

    expect(() => clientSchema.parse(dataTrue)).not.toThrow();
    expect(() => clientSchema.parse(dataFalse)).not.toThrow();
  });

  it('debe validar formato de fecha joinDate', () => {
    const validData = {
      personName: 'Jane',
      personLastName: 'Doe',
      personDocumentType: 'CC' as const,
      personDocumentNumber: '1234567890',
      personPhone: '+1234567890',
      email: 'jane@example.com',
      status: 'ACTIVE' as const,
      isPaymentActive: true,
      joinDate: '2024-01-15',
    };

    expect(() => clientSchema.parse(validData)).not.toThrow();
  });
});
