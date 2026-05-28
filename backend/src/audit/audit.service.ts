import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 100 // Cap at latest 100 entries for efficiency
    });
  }

  async log(action: string, entityType: string, actorId?: string, entityId?: string, metadata?: any) {
    return this.prisma.auditLog.create({
      data: {
        action,
        entityType,
        actorId,
        entityId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  }
}
