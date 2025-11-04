import { signInSchema, signUpSchema, verificationCodeSchema } from '../auth';
import { ZodError } from 'zod';

describe('Auth Validation Schemas', () => {
  describe('signInSchema', () => {
    describe('Email validation', () => {
      it('debe aceptar email válido', () => {
        const validData = {
          email: 'test@example.com',
          password: 'password123',
        };
        
        expect(() => signInSchema.parse(validData)).not.toThrow();
      });

      it('debe rechazar email vacío', () => {
        const invalidData = {
          email: '',
          password: 'password123',
        };
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar email inválido', () => {
        const invalidData = {
          email: 'invalid-email',
          password: 'password123',
        };
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe convertir email a minúsculas', () => {
        const data = {
          email: 'TEST@EXAMPLE.COM',
          password: 'password123',
        };
        
        const result = signInSchema.parse(data);
        expect(result.email).toBe('test@example.com');
      });

      it('debe eliminar espacios del email', () => {
        const data = {
          email: '  test@example.com  ',
          password: 'password123',
        };
        
        const result = signInSchema.parse(data);
        expect(result.email).toBe('test@example.com');
      });

      it('debe rechazar email sin @', () => {
        const invalidData = {
          email: 'testexample.com',
          password: 'password123',
        };
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar email sin dominio', () => {
        const invalidData = {
          email: 'test@',
          password: 'password123',
        };
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    describe('Password validation', () => {
      it('debe aceptar password válido', () => {
        const validData = {
          email: 'test@example.com',
          password: 'anyPassword',
        };
        
        expect(() => signInSchema.parse(validData)).not.toThrow();
      });

      it('debe rechazar password vacío', () => {
        const invalidData = {
          email: 'test@example.com',
          password: '',
        };
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe aceptar password de cualquier longitud (para sign in)', () => {
        const validData = {
          email: 'test@example.com',
          password: '123',
        };
        
        expect(() => signInSchema.parse(validData)).not.toThrow();
      });
    });

    describe('Campos requeridos', () => {
      it('debe rechazar cuando falta email', () => {
        const invalidData = {
          password: 'password123',
        };
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar cuando falta password', () => {
        const invalidData = {
          email: 'test@example.com',
        };
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar cuando faltan ambos campos', () => {
        const invalidData = {};
        
        expect(() => signInSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('signUpSchema', () => {
    describe('Email validation', () => {
      it('debe aceptar email válido', () => {
        const validData = {
          email: 'newuser@example.com',
          password: 'Password123!',
        };
        
        expect(() => signUpSchema.parse(validData)).not.toThrow();
      });

      it('debe rechazar email inválido', () => {
        const invalidData = {
          email: 'invalid',
          password: 'Password123!',
        };
        
        expect(() => signUpSchema.parse(invalidData)).toThrow(ZodError);
      });
    });

    describe('Password strength validation', () => {
      it('debe aceptar password fuerte válido', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Password123!',
        };
        
        expect(() => signUpSchema.parse(validData)).not.toThrow();
      });

      it('debe rechazar password menor a 8 caracteres', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Pass1!',
        };
        
        expect(() => signUpSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar password sin mayúscula', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'password123!',
        };
        
        expect(() => signUpSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar password sin minúscula', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'PASSWORD123!',
        };
        
        expect(() => signUpSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar password sin número', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password!',
        };
        
        expect(() => signUpSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar password sin carácter especial', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Password123',
        };
        
        expect(() => signUpSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe aceptar varios caracteres especiales', () => {
        const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
        
        specialChars.forEach(char => {
          const validData = {
            email: 'test@example.com',
            password: `Password123${char}`,
          };
          
          expect(() => signUpSchema.parse(validData)).not.toThrow();
        });
      });

      it('debe rechazar password mayor a 100 caracteres', () => {
        const invalidData = {
          email: 'test@example.com',
          password: 'Aa1!' + 'a'.repeat(97), // 101 chars total que cumple todos los requisitos
        };
        
        expect(() => signUpSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe aceptar password exactamente de 8 caracteres', () => {
        const validData = {
          email: 'test@example.com',
          password: 'Pass123!',
        };
        
        expect(() => signUpSchema.parse(validData)).not.toThrow();
      });

      it('debe aceptar password de 100 caracteres', () => {
        const validData = {
          email: 'test@example.com',
          password: 'A'.repeat(94) + '1b!CD', // 100 chars
        };
        
        expect(() => signUpSchema.parse(validData)).not.toThrow();
      });
    });

    describe('Combinaciones de requisitos', () => {
      it('debe validar todos los requisitos juntos', () => {
        const validPasswords = [
          'MyP@ssw0rd',
          'Secure123!',
          'Test1234$',
          'Complex9#',
        ];
        
        validPasswords.forEach(password => {
          const validData = {
            email: 'test@example.com',
            password,
          };
          
          expect(() => signUpSchema.parse(validData)).not.toThrow();
        });
      });
    });
  });

  describe('verificationCodeSchema', () => {
    describe('Code validation', () => {
      it('debe aceptar código de 6 dígitos válido', () => {
        const validData = { code: '123456' };
        
        expect(() => verificationCodeSchema.parse(validData)).not.toThrow();
      });

      it('debe rechazar código menor a 6 dígitos', () => {
        const invalidData = { code: '12345' };
        
        expect(() => verificationCodeSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar código mayor a 6 dígitos', () => {
        const invalidData = { code: '1234567' };
        
        expect(() => verificationCodeSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar código con letras', () => {
        const invalidData = { code: '12345a' };
        
        expect(() => verificationCodeSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar código con caracteres especiales', () => {
        const invalidData = { code: '12345!' };
        
        expect(() => verificationCodeSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar código con espacios', () => {
        const invalidData = { code: '123 456' };
        
        expect(() => verificationCodeSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe rechazar código vacío', () => {
        const invalidData = { code: '' };
        
        expect(() => verificationCodeSchema.parse(invalidData)).toThrow(ZodError);
      });

      it('debe aceptar código que empieza con 0', () => {
        const validData = { code: '012345' };
        
        expect(() => verificationCodeSchema.parse(validData)).not.toThrow();
      });

      it('debe aceptar código de todos 0s', () => {
        const validData = { code: '000000' };
        
        expect(() => verificationCodeSchema.parse(validData)).not.toThrow();
      });
    });

    describe('Campos requeridos', () => {
      it('debe rechazar cuando falta el código', () => {
        const invalidData = {};
        
        expect(() => verificationCodeSchema.parse(invalidData)).toThrow(ZodError);
      });
    });
  });

  describe('Mensajes de error', () => {
    it('debe retornar mensaje de error para email inválido en signIn', () => {
      try {
        signInSchema.parse({ email: 'invalid', password: '123' });
      } catch (error) {
        if (error instanceof ZodError) {
          const emailError = error.issues.find(i => i.path[0] === 'email');
          expect(emailError?.message).toContain('válido');
        }
      }
    });

    it('debe retornar mensaje de error para password corto en signUp', () => {
      try {
        signUpSchema.parse({ email: 'test@test.com', password: 'short' });
      } catch (error) {
        if (error instanceof ZodError) {
          const passwordError = error.issues.find(i => i.path[0] === 'password');
          expect(passwordError?.message).toBeDefined();
        }
      }
    });

    it('debe retornar mensaje de error para código inválido', () => {
      try {
        verificationCodeSchema.parse({ code: '123' });
      } catch (error) {
        if (error instanceof ZodError) {
          const codeError = error.issues.find(i => i.path[0] === 'code');
          expect(codeError?.message).toContain('6');
        }
      }
    });
  });
});
