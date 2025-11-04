import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import {
  userDataSchema,
  personalDataSchema,
  workDataSchema,
} from '@/lib/validations/trainers';

describe('Trainer Validations', () => {
  describe('userDataSchema', () => {
    it('debe validar datos de usuario válidos', () => {
      const validData = {
        userName: 'john_doe123',
        userEmail: 'john@example.com',
        userPhone: '+1234567890',
      };

      expect(() => userDataSchema.parse(validData)).not.toThrow();
    });

    it('debe rechazar userName vacío', () => {
      const invalidData = {
        userName: '',
        userEmail: 'john@example.com',
        userPhone: '+1234567890',
      };

      expect(() => userDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe rechazar email inválido', () => {
      const invalidData = {
        userName: 'john_doe',
        userEmail: 'invalid-email',
        userPhone: '+1234567890',
      };

      expect(() => userDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe rechazar email vacío', () => {
      const invalidData = {
        userName: 'john_doe',
        userEmail: '',
        userPhone: '+1234567890',
      };

      expect(() => userDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe permitir teléfono vacío (opcional)', () => {
      const validData = {
        userName: 'john_doe',
        userEmail: 'john@example.com',
        userPhone: '',
      };

      // El schema permite teléfonos vacíos
      expect(() => userDataSchema.parse(validData)).not.toThrow();
    });

    it('debe validar diferentes formatos de email válidos', () => {
      const emails = [
        'test@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
        'user_name@example.com',
      ];

      emails.forEach((email) => {
        const data = {
          userName: 'test_user',
          userEmail: email,
          userPhone: '+1234567890',
        };
        expect(() => userDataSchema.parse(data)).not.toThrow();
      });
    });
  });

  describe('personalDataSchema', () => {
    it('debe validar datos personales válidos', () => {
      const validData = {
        personName: 'John',
        personLastName: 'Doe',
        personBornDate: '1990-01-01',
        personDocumentType: 'CC' as const,
        personDocumentNumber: '1234567890',
      };

      expect(() => personalDataSchema.parse(validData)).not.toThrow();
    });

    it('debe rechazar nombre vacío', () => {
      const invalidData = {
        personName: '',
        personLastName: 'Doe',
        personBornDate: '1990-01-01',
        personDocumentType: 'CC' as const,
        personDocumentNumber: '1234567890',
      };

      expect(() => personalDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe rechazar apellido vacío', () => {
      const invalidData = {
        personName: 'John',
        personLastName: '',
        personBornDate: '1990-01-01',
        personDocumentType: 'CC' as const,
        personDocumentNumber: '1234567890',
      };

      expect(() => personalDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe rechazar fecha de nacimiento vacía', () => {
      const invalidData = {
        personName: 'John',
        personLastName: 'Doe',
        personBornDate: '',
        personDocumentType: 'CC' as const,
        personDocumentNumber: '1234567890',
      };

      expect(() => personalDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe rechazar número de documento vacío', () => {
      const invalidData = {
        personName: 'John',
        personLastName: 'Doe',
        personBornDate: '1990-01-01',
        personDocumentType: 'CC' as const,
        personDocumentNumber: '',
      };

      expect(() => personalDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe aceptar diferentes tipos de documento', () => {
      const documentTypes = ['CC', 'CE', 'TI', 'PASSPORT'] as const;

      documentTypes.forEach((docType) => {
        const data = {
          personName: 'John',
          personLastName: 'Doe',
          personBornDate: '1990-01-01',
          personDocumentType: docType,
          personDocumentNumber: '1234567890',
        };
        expect(() => personalDataSchema.parse(data)).not.toThrow();
      });
    });
  });

  describe('workDataSchema', () => {
    it('debe validar datos de trabajo válidos', () => {
      const validData = {
        branch: 'Sede Principal',
        specialties: ['Funcional', 'Crossfit'],
      };

      expect(() => workDataSchema.parse(validData)).not.toThrow();
    });

    it('debe rechazar sede vacía', () => {
      const invalidData = {
        branch: '',
        specialties: ['Funcional'],
      };

      expect(() => workDataSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('debe permitir array de especialidades vacío (tiene default)', () => {
      const validData = {
        branch: 'Sede Principal',
        specialties: [],
      };

      // El schema tiene default([]) así que un array vacío es válido
      expect(() => workDataSchema.parse(validData)).not.toThrow();
    });

    it('debe validar con una sola especialidad', () => {
      const validData = {
        branch: 'Sede Principal',
        specialties: ['Funcional'],
      };

      expect(() => workDataSchema.parse(validData)).not.toThrow();
    });

    it('debe validar con múltiples especialidades', () => {
      const validData = {
        branch: 'Sede Principal',
        specialties: ['Funcional', 'Crossfit', 'Cardio', 'Pesas'],
      };

      expect(() => workDataSchema.parse(validData)).not.toThrow();
    });
  });
});
