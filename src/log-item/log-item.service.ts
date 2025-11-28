import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLogItemDto } from './dtos/create-log-item.dto';
import { UpdateLogItemDto } from './dtos/update-log-item.dto';
import { ApplicationStatus, InterviewStatus, Prisma } from '@prisma/client';

@Injectable()
export class LogItemService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateLogItemDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: data.applicationId },
      select: {
        userId: true,
        logItems: {
          select: { date: true },
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException('Application of log-item not found or access denied');
    }

    const mostRecentLogDate = new Date(application.logItems[0].date);
    const newDate = new Date(data.date ?? Date.now());

    let interviewData = undefined;

    // If the new log item is an INTERVIEW, create the associated Interview record
    if (data.status === ApplicationStatus.INTERVIEW) {
      const interviewDate = new Date(data.date);

      const isFuture = interviewDate.getTime() > Date.now();
      const interviewStatus = isFuture ? InterviewStatus.UPCOMING : InterviewStatus.DONE;

      interviewData = {
        applicationId: data.applicationId,
        date: interviewDate,
        status: interviewStatus,
        notes: data.notes,
      };

      await this.prisma.interview.create({ data: interviewData });
    }

    const logItem = await this.prisma.logItem.create({
      data,
      include: {
        application: {
          include: {
            interviews: true,
          },
        },
      },
    });

    // update application status if new log item is most recent
    if (newDate > mostRecentLogDate) {
      await this.prisma.application.update({
        where: { id: data.applicationId },
        data: { status: data.status },
      });
    }

    return logItem;
  }

  async update(logItemId: string, userId: string, data: UpdateLogItemDto) {
    const logItem = await this.prisma.logItem.findUnique({
      where: {
        id: logItemId,
      },
      select: {
        applicationId: true,
        status: true,
        date: true,
        application: {
          select: {
            userId: true,
            logItems: true,
          },
        },
      },
    });

    if (!logItem || logItem.application.userId !== userId) {
      throw new NotFoundException(`Log item not found or access denied`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const oldStatus = logItem.status;
        const newStatus = data.status ?? oldStatus;

        // Case 1: log item switched to interview => create or update interview
        if (newStatus === ApplicationStatus.INTERVIEW) {
          const oldDate = logItem.date;

          const existingInterview = await tx.interview.findFirst({
            where: {
              applicationId: logItem.applicationId,
              date: oldDate,
            },
          });

          const interviewDate = data.date ? new Date(data.date) : oldDate;
          const isFuture = interviewDate.getTime() > Date.now();
          const interviewStatus = isFuture ? InterviewStatus.UPCOMING : InterviewStatus.DONE;

          if (existingInterview) {
            await tx.interview.update({
              where: { id: existingInterview.id },
              data: {
                date: interviewDate,
                status: interviewStatus,
                notes: data.notes ?? existingInterview.notes,
              },
            });
          } else {
            await tx.interview.create({
              data: {
                applicationId: logItem.applicationId,
                date: interviewDate,
                status: interviewStatus,
                notes: data.notes ?? undefined,
              },
            });
          }
        }

        // Case 2: log item switched away from interview => delete interview
        if (
          oldStatus === ApplicationStatus.INTERVIEW &&
          newStatus !== ApplicationStatus.INTERVIEW
        ) {
          const oldInterview = await tx.interview.findFirst({
            where: {
              applicationId: logItem.applicationId,
              date: logItem.date,
            },
          });

          if (oldInterview) {
            await tx.interview.delete({
              where: { id: oldInterview.id },
            });
          }
        }

        const mostRecentLogDate = new Date(logItem.application.logItems[0].date);
        const newDate = new Date(data.date ?? Date.now());

        // update application status if new log item is most recent
        if (newDate > mostRecentLogDate) {
          await this.prisma.application.update({
            where: { id: logItem.applicationId },
            data: { status: data.status },
          });
        }

        // Always update the log item itself
        return await tx.logItem.update({
          where: { id: logItemId },
          data,
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error(`LogItem with id ${logItemId} not found`);
      }
      throw error;
    }
  }

  async delete(logItemId: string, userId: string) {
    const logItem = await this.prisma.logItem.findUnique({
      where: {
        id: logItemId,
      },
      select: {
        applicationId: true,
        status: true,
        date: true,
        application: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!logItem || logItem.application.userId !== userId) {
      throw new NotFoundException(`Log item not found or access denied`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const logItemCount = await tx.logItem.count({
          where: {
            applicationId: logItem.applicationId,
          },
        });

        // If deleting the last log item, create a DRAFT log item to maintain application integrity
        if (logItemCount === 1) {
          await tx.logItem.create({
            data: {
              applicationId: logItem.applicationId,
              status: ApplicationStatus.DRAFT,
              date: new Date(Date.now()),
            },
          });
        }

        // If the log item to be deleted is an INTERVIEW, delete the associated Interview record
        if (logItem.status === ApplicationStatus.INTERVIEW) {
          const oldInterview = await tx.interview.findFirst({
            where: {
              applicationId: logItem.applicationId,
              date: logItem.date,
            },
            select: { id: true },
          });

          if (oldInterview) {
            await tx.interview.delete({ where: { id: oldInterview.id } });
          }
        }

        const application = await this.prisma.application.findUnique({
          where: { id: logItem.applicationId },
          select: {
            logItems: {
              select: { date: true, status: true },
              orderBy: { date: 'desc' },
              take: 2,
            },
          },
        });

        // Update application status to next most recent log item's status
        if (application && application.logItems.length > 1) {
          await this.prisma.application.update({
            where: { id: logItem.applicationId },
            data: { status: application.logItems[1].status },
          });
        }

        return await tx.logItem.delete({
          where: { id: logItemId },
          include: { application: true },
        });
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Log item with id ${logItemId} not found`);
      }
      throw error;
    }
  }

  async findAllByApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: { userId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException('Application of log-items not found or access denied');
    }

    return await this.prisma.logItem.findMany({
      where: {
        applicationId,
      },
    });
  }
}
