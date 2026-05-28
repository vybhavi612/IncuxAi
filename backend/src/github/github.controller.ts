import { Controller, Get, Post, Param, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { GithubService } from './github.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('github')
@UseGuards(JwtAuthGuard)
export class GithubController {
  constructor(private githubService: GithubService) {}

  @Get('metrics')
  async getOwnMetrics(@Req() req: any) {
    return this.githubService.getMetrics(req.user.id);
  }

  @Get('admin/metrics')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async getMetricsAdmin() {
    return this.githubService.getMetricsAdmin();
  }

  @Post('sync/:userId')
  async syncMetrics(@Req() req: any, @Param('userId') userId: string) {
    // Standard users can only sync themselves; Admins can sync anyone
    if (req.user.role !== Role.ADMIN && req.user.id !== userId) {
      throw new ForbiddenException('You are not authorized to sync these repositories');
    }
    return this.githubService.syncUserMetrics(req.user.id, userId);
  }
}
