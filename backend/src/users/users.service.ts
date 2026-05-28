import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        githubUsername: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        githubUsername: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
        repositories: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(adminId: string, data: any) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password || 'user123', salt);

    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role || 'USER',
        active: data.active !== undefined ? data.active : true,
        timezone: data.timezone || 'UTC',
        githubUsername: data.githubUsername,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_CREATE_USER',
        entityType: 'USER',
        entityId: user.id,
        metadata: JSON.stringify({ name: user.name, email: user.email, role: user.role })
      }
    });

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async updateUser(adminId: string, id: string, data: any) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      active: data.active,
      timezone: data.timezone,
      githubUsername: data.githubUsername,
    };

    if (data.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.passwordHash = bcrypt.hashSync(data.password, salt);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_UPDATE_USER',
        entityType: 'USER',
        entityId: id,
        metadata: JSON.stringify({ updatedFields: Object.keys(data).filter(k => k !== 'password') })
      }
    });

    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }

  async updateOwnProfile(userId: string, data: any) {
    const updateData: any = {
      name: data.name,
      timezone: data.timezone,
      githubUsername: data.githubUsername,
    };

    if (data.githubToken) {
      updateData.githubToken = data.githubToken;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_UPDATE_PROFILE',
        entityType: 'USER',
        entityId: userId,
        metadata: JSON.stringify({ name: updated.name, timezone: updated.timezone, githubUsername: updated.githubUsername })
      }
    });

    const { passwordHash: _, githubToken: __, ...result } = updated;
    return result;
  }

  async changeOwnPassword(userId: string, data: any) {
    const { oldPassword, newPassword } = data;
    if (!oldPassword || !newPassword) {
      throw new BadRequestException('Old and new passwords are required');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !bcrypt.compareSync(oldPassword, user.passwordHash)) {
      throw new BadRequestException('Incorrect old password');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'USER_CHANGE_PASSWORD',
        entityType: 'USER',
        entityId: userId,
      }
    });

    return { success: true };
  }

  async resetUserPassword(adminId: string, userId: string, data: any) {
    const { password } = data;
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_RESET_PASSWORD',
        entityType: 'USER',
        entityId: userId,
      }
    });

    return { success: true };
  }

  async deleteUser(adminId: string, id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_DELETE_USER',
        entityType: 'USER',
        entityId: id,
        metadata: JSON.stringify({ deletedName: user.name, deletedEmail: user.email })
      }
    });

    return { success: true };
  }

  // Repository Assignments
  async getRepositories(userId: string) {
    return this.prisma.repository.findMany({
      where: { userId }
    });
  }

  async addRepository(adminId: string, userId: string, data: any) {
    const repo = await this.prisma.repository.create({
      data: {
        userId,
        repoName: data.repoName,
        repoUrl: data.repoUrl,
        provider: data.provider || 'github',
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_ADD_REPO',
        entityType: 'REPOSITORY',
        entityId: repo.id,
        metadata: JSON.stringify({ repoName: repo.repoName, assignedTo: userId })
      }
    });

    return repo;
  }

  async removeRepository(adminId: string, id: string) {
    const repo = await this.prisma.repository.findUnique({ where: { id } });
    if (!repo) {
      throw new NotFoundException('Repository not found');
    }

    await this.prisma.repository.delete({ where: { id } });

    await this.prisma.auditLog.create({
      data: {
        actorId: adminId,
        action: 'ADMIN_REMOVE_REPO',
        entityType: 'REPOSITORY',
        entityId: id,
        metadata: JSON.stringify({ repoName: repo.repoName, unassignedFrom: repo.userId })
      }
    });

    return { success: true };
  }
}
