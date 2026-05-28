import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { Role } from '@prisma/client';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('export')
  async exportReport(
    @Query('format') format: string,
    @Query('category') category: string,
    @Res() res: Response
  ) {
    if (format === 'csv') {
      const csv = await this.reportsService.generateCSV(category);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=workpulse_${category}_report_${Date.now()}.csv`);
      return res.status(200).send(csv);
    } else if (format === 'print') {
      const html = await this.reportsService.generatePrintableReport(category);
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } else {
      return res.status(400).json({ message: 'Invalid export format parameter. Choose either "csv" or "print".' });
    }
  }
}
