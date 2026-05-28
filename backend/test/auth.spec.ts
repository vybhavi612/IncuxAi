import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AuthService Unit Tests', () => {
  let service: AuthService;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    setting: {
      findUnique: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  const mockJwt = {
    sign: jest.fn(() => 'test_token'),
    verify: jest.fn(() => ({ sub: 'user_id' })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Registration guard', () => {
    it('should throw an error if self-signup registration is disabled in settings', async () => {
      mockPrisma.setting.findUnique.mockResolvedValue({ key: 'registration_allowed', value: 'false' });

      await expect(
        service.register({ name: 'Bob', email: 'bob@workpulse.com', pass: 'pass123' })
      ).rejects.toThrow('Self-registration is currently disabled by the system administrator');
    });
  });
});
