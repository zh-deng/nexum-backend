import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ApplicationStatus, TimeFrameType } from '../types/enums';
import { calculateTimeFrame, getTimeFrameMonths } from '../utils/chart.helpers';

@Injectable()
export class ChartService {
  constructor(private prisma: PrismaService) {}

  async getPieChartData(userId: string, timeFrame: TimeFrameType) {
    const { statuses, startDate } = calculateTimeFrame(timeFrame);

    const counts = await this.prisma.$transaction(
      statuses.map((status) =>
        this.prisma.application.count({
          where: {
            userId,
            status,
            logItems: {
              some: {
                status,
                date: {
                  gt: startDate.toISOString(),
                },
              },
            },
          },
        })
      )
    );

    return statuses.reduce(
      (acc, status, idx) => {
        const statusKeyMap: Partial<Record<ApplicationStatus, string>> = {
          [ApplicationStatus.APPLIED]: 'appliedCount',
          [ApplicationStatus.INTERVIEW]: 'interviewCount',
          [ApplicationStatus.GHOSTED]: 'ghostedCount',
          [ApplicationStatus.OFFER]: 'offerCount',
          [ApplicationStatus.HIRED]: 'hiredCount',
          [ApplicationStatus.DECLINED_OFFER]: 'declinedCount',
          [ApplicationStatus.REJECTED]: 'rejectedCount',
          [ApplicationStatus.WITHDRAWN]: 'withdrawnCount',
        };
        const key = statusKeyMap[status] ?? status.toString();

        acc[key] = counts[idx];
        return acc;
      },
      {} as Record<string, number>
    );
  }

  async getBarChartData(userId: string, timeFrame: TimeFrameType) {
    const { startDate } = calculateTimeFrame(timeFrame);

    const isAllTime = timeFrame === TimeFrameType.ALL_TIME;
    let periods: string[] = [];

    // 🔹 Determine start date for all_time dynamically
    let allTimeStartYear: number | null = null;

    if (isAllTime) {
      const earliestLog = await this.prisma.logItem.findFirst({
        where: {
          application: { userId },
          status: { not: 'DRAFT' },
        },
        orderBy: { date: 'asc' },
        select: { date: true },
      });

      if (earliestLog) {
        allTimeStartYear = earliestLog.date!.getFullYear();
      } else {
        // fallback: current year if no logs found
        allTimeStartYear = new Date().getFullYear();
      }

      const now = new Date();
      const years = [];
      for (let y = allTimeStartYear; y <= now.getFullYear(); y++) {
        years.push(y.toString());
      }
      periods = years;
    } else {
      periods = getTimeFrameMonths(timeFrame);
    }

    // 🔹 SQL grouping unit (month or year)
    const dateTruncUnit = isAllTime ? 'year' : 'month';

    const results = await this.prisma.$queryRaw<
      { period: Date; status: ApplicationStatus; count: bigint }[]
    >`
    SELECT
      DATE_TRUNC(${dateTruncUnit}, li."date") AS period,
      a."status",
      COUNT(*) AS count
    FROM "Application" a
    JOIN LATERAL (
      SELECT l."date"
      FROM "LogItem" l
      WHERE l."applicationId" = a."id"
        AND l."status" = a."status"
      ORDER BY l."date" DESC
      LIMIT 1
    ) li ON true
    WHERE a."userId" = ${userId}
      AND li."date" >= ${startDate}
      AND a."status" != 'DRAFT'
    GROUP BY period, a."status"
    ORDER BY period ASC;
  `;

    // 🔹 Map SQL results to chart data
    const barChartData = periods.map((label) => {
      const periodData = results.filter((r) => {
        const d = new Date(r.period);
        const formatted = isAllTime
          ? d.getFullYear().toString()
          : new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
        return formatted === label;
      });

      const statusCounts = Object.fromEntries(
        Object.values(ApplicationStatus)
          .filter((s) => s !== ApplicationStatus.DRAFT)
          .map((status) => [
            status,
            Number(periodData.find((d) => d.status === status)?.count || 0),
          ])
      );

      const total = Object.values(statusCounts).reduce((sum, val) => sum + val, 0);

      return { period: label, ...statusCounts, total };
    });

    return barChartData;
  }

  async getSankeyChartData(userId: string, timeFrame: TimeFrameType) {}
}
