import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // --- ADMIN ONLY ROUTES ---

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async createUser(@Req() req: any, @Body() body: any) {
    return this.usersService.createUser(req.user.id, body);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateUser(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.usersService.updateUser(req.user.id, id, body);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async deleteUser(@Req() req: any, @Param('id') id: string) {
    return this.usersService.deleteUser(req.user.id, id);
  }

  @Put(':id/reset-password')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async resetPassword(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.usersService.resetUserPassword(req.user.id, id, body);
  }

  @Post(':id/repos')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async addRepo(@Req() req: any, @Param('id') userId: string, @Body() body: any) {
    return this.usersService.addRepository(req.user.id, userId, body);
  }

  @Delete('repos/:repoId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async removeRepo(@Req() req: any, @Param('repoId') repoId: string) {
    return this.usersService.removeRepository(req.user.id, repoId);
  }

  // --- SHARED / SELF ROUTES ---

  @Get(':id')
  async getUser(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== Role.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('You are not authorized to view this profile');
    }
    return this.usersService.findOne(id);
  }

  @Put('profile/update')
  async updateProfile(@Req() req: any, @Body() body: any) {
    return this.usersService.updateOwnProfile(req.user.id, body);
  }

  @Put('profile/change-password')
  async changePassword(@Req() req: any, @Body() body: any) {
    return this.usersService.changeOwnPassword(req.user.id, body);
  }

  @Get(':id/repos')
  async getRepos(@Req() req: any, @Param('id') id: string) {
    if (req.user.role !== Role.ADMIN && req.user.id !== id) {
      throw new ForbiddenException('You are not authorized to view these repositories');
    }
    return this.usersService.getRepositories(id);
  }
}
