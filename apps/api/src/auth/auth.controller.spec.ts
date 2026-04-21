import { Test, TestingModule } from '@nestjs/testing';
import {
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/google', () => {
    it('should return accessToken and user on successful login', async () => {
      const loginResponse = {
        accessToken: 'jwt-token-123',
        user: {
          id: 'user-1',
          email: 'aluno@utfpr.edu.br',
          name: 'Test User',
          role: 'STUDENT',
        },
      };

      mockAuthService.login.mockResolvedValue(loginResponse);

      const result = await controller.googleLogin({
        idToken: 'valid-google-token',
      });

      expect(result).toEqual(loginResponse);
      expect(result.accessToken).toBeDefined();
      expect(result.user.id).toBe('user-1');
      expect(result.user.email).toBe('aluno@utfpr.edu.br');
      expect(result.user.role).toBe('STUDENT');
    });

    it('should propagate 401 for invalid Google token', async () => {
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Token de autenticação inválido'),
      );

      await expect(
        controller.googleLogin({ idToken: 'bad-token' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should propagate 403 for non-enrolled email', async () => {
      mockAuthService.login.mockRejectedValue(
        new ForbiddenException(
          'E-mail não matriculado em nenhuma disciplina ativa',
        ),
      );

      await expect(
        controller.googleLogin({ idToken: 'valid-but-not-enrolled' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('GET /auth/me', () => {
    it('should return user profile from @CurrentUser decorator', () => {
      const mockUser = {
        id: 'user-1',
        email: 'aluno@utfpr.edu.br',
        name: 'Test User',
        role: 'STUDENT',
        ra: null,
        createdAt: new Date(),
      };

      const result = controller.getProfile(mockUser as any);

      expect(result).toEqual({
        id: 'user-1',
        email: 'aluno@utfpr.edu.br',
        name: 'Test User',
        role: 'STUDENT',
      });
      // Ensure sensitive fields are NOT leaked
      expect(result).not.toHaveProperty('ra');
      expect(result).not.toHaveProperty('createdAt');
    });
  });
});
