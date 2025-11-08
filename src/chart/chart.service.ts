import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TimeFrameType } from '../types/enums';
import { calculateTimeFrame, getTimeFrameMonths } from '../utils/chart.helpers';
import { ApplicationStatus } from '@prisma/client';

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
        allTimeStartYear = earliestLog.date.getFullYear();
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

  async getSankeyChartData(userId: string, timeFrame: TimeFrameType) {
    // Calculate the start date for the given time frame
    const { startDate } = calculateTimeFrame(timeFrame);

    // Map internal application statuses to human-readable labels
    const statusMap: Record<string, string> = {
      APPLIED: 'Applied / No Answer',
      OFFER: 'Offer',
      HIRED: 'Hired',
      DECLINED_OFFER: 'Declined',
      REJECTED: 'Rejected',
      GHOSTED: 'Ghosted',
      WITHDRAWN: 'Withdrawn',
    };

    // Fetch all applications that have log items updated after the start date
    const apps = await this.prisma.application.findMany({
      where: {
        userId,
        logItems: {
          some: { date: { gt: startDate.toISOString() } },
        },
      },
      select: {
        logItems: {
          where: { date: { gt: startDate.toISOString() } },
          select: { status: true, date: true },
          orderBy: { date: 'asc' },
        },
      },
    });

    // Holds all link transitions (from→to) and their counts
    const linkMap = new Map<string, number>();
    // Tracks all nodes that appear in the graph
    const usedNodes = new Set<string>();

    // Process each application’s status history
    for (const app of apps) {
      // Sort log items chronologically
      const sorted = [...app.logItems]
        .filter((li) => li.date != null)
        .sort(
          (a, b) =>
            new Date(a.date as Date | string).getTime() -
            new Date(b.date as Date | string).getTime()
        );

      if (sorted.length === 0) continue;

      const labels: string[] = [];
      let interviewCount = 0;

      // Convert statuses to readable labels, applying special rules
      for (let i = 0; i < sorted.length; i++) {
        const item = sorted[i];
        const isLast = i === sorted.length - 1;

        // Skip draft statuses entirely
        if (item.status === ApplicationStatus.DRAFT) continue;

        // Number interviews sequentially (1st, 2nd, etc.)
        if (item.status === ApplicationStatus.INTERVIEW) {
          interviewCount += 1;
          labels.push(`${interviewCount}. Interview`);
          continue;
        }

        // Only include "Applied" if it's the most recent status
        if (item.status === ApplicationStatus.APPLIED) {
          if (isLast) {
            labels.push('Applied / No Answer');
          }
          continue; // skip all other APPLIED statuses
        }

        // Map remaining statuses to readable names
        const mapped = statusMap[item.status] ?? item.status;
        labels.push(mapped);
      }

      if (labels.length === 0) continue;

      // Always connect "Applications" → first actual status
      {
        const first = labels[0];
        const key = `Applications->${first}`;
        linkMap.set(key, (linkMap.get(key) || 0) + 1);
        usedNodes.add('Applications');
        usedNodes.add(first);
      }

      // Build transitions between consecutive statuses
      for (let i = 0; i < labels.length - 1; i++) {
        const from = labels[i];
        const to = labels[i + 1];
        if (!from || !to || from === to) continue;
        const key = `${from}->${to}`;
        linkMap.set(key, (linkMap.get(key) || 0) + 1);
        usedNodes.add(from);
        usedNodes.add(to);
      }
    }

    // Assign each node a category for coloring/styling in the Sankey chart
    function getCategory(name: string): string {
      if (name === 'Applications') return 'start';
      if (name === 'Applied / No Answer') return 'finished'; // final APPLIED case
      if (name.includes('Interview') || name === 'Ghosted' || name === 'Offer') {
        return 'active';
      }
      return 'finished'; // default group
    }

    // Convert the node and link sets into Sankey-compatible arrays
    const nodes = Array.from(usedNodes).map((name) => ({
      name,
      category: getCategory(name),
    }));

    const links = Array.from(linkMap.entries()).map(([key, value]) => {
      const [source, target] = key.split('->');
      return { source, target, value };
    });

    // Final Sankey data structure
    const data = { nodes, links };

    // Return structured Sankey data
    return data;
  }
}
