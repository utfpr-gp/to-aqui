import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client, TokenPayload } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../generated/prisma';

export interface GooglePayload {
  email: string;
  name: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
    );
  }

  async validateGoogleToken(idToken: string): Promise<GooglePayload> {
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload: TokenPayload | undefined = ticket.getPayload();

      if (!payload || !payload.email) {
        throw new UnauthorizedException('Token de autenticação inválido');
      }

      return {
        email: payload.email,
        name: payload.name || payload.email,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new UnauthorizedException('Token de autenticação inválido');
    }
  }

  async login(
    idToken: string,
  ): Promise<{ accessToken: string; user: UserProfile }> {
    const googlePayload = await this.validateGoogleToken(idToken);

    // Check if email exists in any active enrollment
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentEmail: googlePayload.email },
    });

    if (!enrollment) {
      throw new ForbiddenException(
        'E-mail não matriculado em nenhuma disciplina ativa',
      );
    }

    const user = await this.findOrCreateUser(
      googlePayload.email,
      googlePayload.name,
    );

    await this.linkEnrollments(user.id, user.email);

    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(jwtPayload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async findOrCreateUser(email: string, name: string): Promise<User> {
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          role: 'STUDENT',
        },
      });
    }

    return user;
  }

  async linkEnrollments(userId: string, email: string): Promise<void> {
    await this.prisma.enrollment.updateMany({
      where: {
        studentEmail: email,
        studentId: null,
      },
      data: { studentId: userId },
    });
  }
}
