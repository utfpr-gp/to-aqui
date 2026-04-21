import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

// Mock google-auth-library
jest.mock('google-auth-library', () => {
  const mockVerifyIdToken = jest.fn();
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({
      verifyIdToken: mockVerifyIdToken,
    })),
    mockVerifyIdToken,
  };
});

const { mockVerifyIdToken } = jest.requireMock('google-auth-library');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    enrollment: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mock-jwt-token'),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        GOOGLE_CLIENT_ID: 'test-client-id',
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: '8h',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateGoogleToken', () => {
    it('should return email and name for a valid Google token', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'aluno@alunos.utfpr.edu.br',
          name: 'João Silva',
        }),
      });

      const result = await service.validateGoogleToken('valid-id-token');

      expect(result).toEqual({
        email: 'aluno@alunos.utfpr.edu.br',
        name: 'João Silva',
      });
    });

    it('should throw UnauthorizedException for an invalid/expired token', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('Token expired'));

      await expect(
        service.validateGoogleToken('expired-token'),
      ).rejects.toThrow(UnauthorizedException);

      await expect(
        service.validateGoogleToken('expired-token'),
      ).rejects.toThrow('Token de autenticação inválido');
    });

    it('should throw UnauthorizedException when payload has no email', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ name: 'No Email' }),
      });

      await expect(
        service.validateGoogleToken('no-email-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    const validGooglePayload = {
      email: 'aluno@gmail.com',
      name: 'Maria Souza',
    };

    const mockUser = {
      id: 'user-uuid-1',
      email: 'aluno@gmail.com',
      name: 'Maria Souza',
      ra: null,
      role: 'STUDENT',
      createdAt: new Date(),
    };

    beforeEach(() => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => validGooglePayload,
      });
    });

    it('should return accessToken and user profile when email is enrolled', async () => {
      mockPrismaService.enrollment.findFirst.mockResolvedValue({
        id: 'enroll-1',
        courseId: 'course-1',
        studentEmail: 'aluno@gmail.com',
        studentId: null,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.enrollment.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.login('valid-token');

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user).toEqual({
        id: 'user-uuid-1',
        email: 'aluno@gmail.com',
        name: 'Maria Souza',
        role: 'STUDENT',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-uuid-1',
        email: 'aluno@gmail.com',
        role: 'STUDENT',
      });
    });

    it('should throw ForbiddenException when email is NOT in any enrollment', async () => {
      mockPrismaService.enrollment.findFirst.mockResolvedValue(null);

      await expect(service.login('valid-token')).rejects.toThrow(
        ForbiddenException,
      );

      await expect(service.login('valid-token')).rejects.toThrow(
        'E-mail não matriculado em nenhuma disciplina ativa',
      );
    });

    it('should find existing user instead of creating a new one', async () => {
      mockPrismaService.enrollment.findFirst.mockResolvedValue({
        id: 'enroll-1',
        courseId: 'course-1',
        studentEmail: 'aluno@gmail.com',
        studentId: 'user-uuid-1',
      });
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.enrollment.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.login('valid-token');

      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
      expect(result.user.id).toBe('user-uuid-1');
    });

    it('should create user and link enrollments on first login', async () => {
      mockPrismaService.enrollment.findFirst.mockResolvedValue({
        id: 'enroll-1',
        courseId: 'course-1',
        studentEmail: 'aluno@gmail.com',
        studentId: null,
      });
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockPrismaService.enrollment.updateMany.mockResolvedValue({ count: 2 });

      await service.login('valid-token');

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'aluno@gmail.com',
          name: 'Maria Souza',
          role: 'STUDENT',
        },
      });
      expect(mockPrismaService.enrollment.updateMany).toHaveBeenCalledWith({
        where: { studentEmail: 'aluno@gmail.com', studentId: null },
        data: { studentId: 'user-uuid-1' },
      });
    });

    it('should accept any email domain (@gmail.com, @alunos.utfpr.edu.br) if enrolled', async () => {
      const domains = [
        'aluno@gmail.com',
        'aluno@alunos.utfpr.edu.br',
        'aluno@hotmail.com',
      ];

      for (const email of domains) {
        mockVerifyIdToken.mockResolvedValue({
          getPayload: () => ({ email, name: 'Test' }),
        });
        mockPrismaService.enrollment.findFirst.mockResolvedValue({
          id: 'e1',
          studentEmail: email,
        });
        mockPrismaService.user.findUnique.mockResolvedValue({
          ...mockUser,
          email,
        });
        mockPrismaService.enrollment.updateMany.mockResolvedValue({ count: 0 });

        const result = await service.login('valid-token');
        expect(result.user.email).toBe(email);
      }
    });
  });
});
