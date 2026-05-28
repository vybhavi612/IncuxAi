import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateCSV(category: string): Promise<string> {
    if (category === 'attendance') {
      const records = await this.prisma.attendance.findMany({
        include: { user: true },
        orderBy: { checkIn: 'desc' }
      });

      let csv = 'Attendance ID,User Name,Email,Check In (Server),Check Out (Server),Timezone,Duration (Mins),Status,Admin Override,Override Reason\n';
      records.forEach((r) => {
        const checkOutStr = r.checkOut ? r.checkOut.toISOString() : 'ACTIVE';
        const overrideReasonStr = r.overrideReason ? r.overrideReason.replace(/"/g, '""') : '';
        csv += `"${r.id}","${r.user.name}","${r.user.email}","${r.checkIn.toISOString()}","${checkOutStr}","${r.timezone}",${r.duration || 0},"${r.status}",${r.adminOverride},"${overrideReasonStr}"\n`;
      });
      return csv;
    } else if (category === 'productivity') {
      const records = await this.prisma.gitHubMetric.findMany({
        include: { repository: { include: { user: true } } },
        orderBy: { snapshotDate: 'desc' }
      });

      let csv = 'Metric ID,User Name,Repository Name,Commits,PRs,Issues,Merged PRs,Additions,Deletions,Snapshot Date\n';
      records.forEach((r) => {
        csv += `"${r.id}","${r.repository.user.name}","${r.repository.repoName}",${r.commits},${r.prs},${r.issues},${r.mergedPrs},${r.additions},${r.deletions},"${r.snapshotDate.toISOString().split('T')[0]}"\n`;
      });
      return csv;
    } else {
      throw new BadRequestException('Invalid CSV report category.');
    }
  }

  async generatePrintableReport(category: string): Promise<string> {
    const today = new Date().toLocaleDateString();
    
    if (category === 'attendance') {
      const records = await this.prisma.attendance.findMany({
        include: { user: true },
        orderBy: { checkIn: 'desc' },
        take: 50
      });

      return this.wrapHTMLReport('Attendance Telemetry Report', `
        <div class="report-header">
          <h1>WorkPulse Attendance Ledger</h1>
          <p>Generated on: ${today} | Scope: Latest 50 Records</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Email</th>
              <th>Check In (UTC)</th>
              <th>Check Out (UTC)</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Override</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(r => `
              <tr>
                <td><strong>${r.user.name}</strong></td>
                <td>${r.user.email}</td>
                <td>${r.checkIn.toLocaleString()}</td>
                <td>${r.checkOut ? r.checkOut.toLocaleString() : '<span class="status-badge active">ON WORKTIME</span>'}</td>
                <td>${r.duration ? `${Math.floor(r.duration / 60)}h ${r.duration % 60}m` : '0m'}</td>
                <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                <td>${r.adminOverride ? `<span class="override-label" title="${r.overrideReason || ''}">OVERRIDDEN</span>` : 'NO'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `);
    } else if (category === 'productivity') {
      const records = await this.prisma.gitHubMetric.findMany({
        include: { repository: { include: { user: true } } },
        orderBy: { snapshotDate: 'desc' },
        take: 50
      });

      return this.wrapHTMLReport('Developer Productivity Report', `
        <div class="report-header">
          <h1>WorkPulse Developer Contribution Ledger</h1>
          <p>Generated on: ${today} | Scope: Latest 50 Code Sync Snapshots</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Developer</th>
              <th>Repository</th>
              <th>Date</th>
              <th>Commits</th>
              <th>PRs</th>
              <th>Issues</th>
              <th>Additions</th>
              <th>Deletions</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(r => {
              const score = Math.min(100, Math.max(0, (r.commits * 15) + (r.prs * 25) + Math.floor(r.additions / 10)));
              return `
                <tr>
                  <td><strong>${r.repository.user.name}</strong></td>
                  <td><code>${r.repository.repoName}</code></td>
                  <td>${r.snapshotDate.toISOString().split('T')[0]}</td>
                  <td>${r.commits}</td>
                  <td>${r.prs}</td>
                  <td>${r.issues}</td>
                  <td class="add">+${r.additions}</td>
                  <td class="del">-${r.deletions}</td>
                  <td><strong>${score}%</strong></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `);
    } else {
      throw new BadRequestException('Invalid printable report category.');
    }
  }

  private wrapHTMLReport(title: string, bodyContent: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            padding: 40px;
            background-color: #ffffff;
            margin: 0;
          }
          .report-header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          h1 {
            margin: 0 0 8px 0;
            font-size: 26px;
            color: #0f172a;
          }
          p {
            margin: 0;
            font-size: 14px;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background-color: #f8fafc;
            color: #475569;
            font-weight: 600;
            text-align: left;
            padding: 12px 16px;
            border-bottom: 2px solid #e2e8f0;
          }
          td {
            padding: 12px 16px;
            border-bottom: 1px solid #f1f5f9;
          }
          tr:hover {
            background-color: #f8fafc;
          }
          .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 9999px;
            font-weight: 600;
            font-size: 11px;
            text-transform: uppercase;
          }
          .status-badge.present {
            background-color: #dcfce7;
            color: #15803d;
          }
          .status-badge.incomplete {
            background-color: #fef9c3;
            color: #a16207;
          }
          .status-badge.absent {
            background-color: #fee2e2;
            color: #b91c1c;
          }
          .status-badge.active {
            background-color: #dbeafe;
            color: #1d4ed8;
          }
          .override-label {
            background-color: #f1f5f9;
            color: #475569;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }
          code {
            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
            background-color: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
          }
          .add { color: #16a34a; font-weight: 500; }
          .del { color: #dc2626; font-weight: 500; }
          @media print {
            body { padding: 0; }
            th { background-color: #f1f5f9 !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        ${bodyContent}
        <script>
          window.onload = function() {
            // Automatically prompt print panel
            window.print();
          }
        </script>
      </body>
      </html>
    `;
  }
}
