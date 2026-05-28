import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && user.active && bcrypt.compareSync(pass, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, timezone: user.timezone };
    
    // Create audit log for security audit trail
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_LOGIN',
        entityType: 'USER',
        entityId: user.id,
        metadata: JSON.stringify({ name: user.name, role: user.role, email: user.email })
      }
    });

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123!',
        expiresIn: '1h',
      }),
      refresh_token: this.jwtService.sign({ sub: user.id }, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_456!',
        expiresIn: '7d',
      }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        timezone: user.timezone,
        githubUsername: user.githubUsername
      }
    };
  }

  async register(data: { name: string; email: string; pass: string; timezone?: string }) {
    // Check if user registrations are allowed in Settings
    const regSetting = await this.prisma.setting.findUnique({ where: { key: 'registration_allowed' } });
    const registrationAllowed = regSetting ? regSetting.value === 'true' : true;

    if (!registrationAllowed) {
      throw new ForbiddenException('Self-registration is currently disabled by the system administrator');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.pass, salt);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: 'USER', // Self-register accounts are always default USER role
        active: true,
        timezone: data.timezone || 'UTC',
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'USER_REGISTER',
        entityType: 'USER',
        entityId: user.id,
        metadata: JSON.stringify({ name: user.name, email: user.email, timezone: user.timezone })
      }
    });

    return this.login(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_token_key_456!',
      });
      
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user || !user.active) {
        throw new UnauthorizedException('User account suspended or does not exist');
      }

      const accessPayload = { email: user.email, sub: user.id, role: user.role, timezone: user.timezone };
      
      return {
        access_token: this.jwtService.sign(accessPayload, {
          secret: process.env.JWT_ACCESS_SECRET || 'super_secret_access_token_key_123!',
          expiresIn: '1h',
        }),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          timezone: user.timezone,
          githubUsername: user.githubUsername
        }
      };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string) {
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_LOGOUT',
        entityType: 'USER',
        entityId: userId,
        metadata: JSON.stringify({ userId })
      }
    });
    return { success: true };
  }
}
