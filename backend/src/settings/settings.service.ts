import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const list = await this.prisma.setting.findMany();
    // Reduce into an easily-consumable key-value map
    return list.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
  }

  async getVal(key: string, defaultVal: string = ''): Promise<string> {
    const item = await this.prisma.setting.findUnique({ where: { key } });
    return item ? item.value : defaultVal;
  }

  async update(adminId: string, settings: Record<string, string>) {
    for (const [key, value] of Object.entries(settings)) {
      await this.prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_UPDATE_SETTINGS',
        entityType: 'SETTINGS',
        metadata: JSON.stringify({ keysUpdated: Object.keys(settings) })
      }
    });

    return this.findAll();
  }
}
