import { Controller, Get, Put, Body, Req, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.findAll();
  }

  @Put()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async updateSettings(@Req() req: any, @Body() body: Record<string, string>) {
    return this.settingsService.update(req.user.id, body);
  }
}
