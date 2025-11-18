import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dtos/create-reminder.dto';
import { UpdateReminderDto } from './dtos/update-reminder.dto';
import { Prisma, ReminderStatus } from '@prisma/client';
import { ReminderSortType, ReminderStatusFilter } from '../types/enums';
import { EmailProducerService } from '../queues/email-producer.service';

@Injectable()
export class ReminderService {
  constructor(
    private prisma: PrismaService,
    private readonly emailProducer: EmailProducerService
  ) {}

  async create(userId: string, data: CreateReminderDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: data.applicationId },
      select: {
        userId: true,
      },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException('Application of reminder not found or access denied');
    }

    // First create the reminder
    const reminder = await this.prisma.reminder.create({
      data,
    });

    // Then add the BullMQ job
    await this.emailProducer.addReminderEmailJob(reminder.id);

    return reminder;
  }

  async update(reminderId: string, userId: string, data: UpdateReminderDto) {
    const reminder = await this.prisma.reminder.findUnique({
      where: {
        id: reminderId,
      },
      select: {
        status: true,
        application: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!reminder || reminder.application.userId !== userId) {
      throw new NotFoundException(`Reminder not found or access denied`);
    }

    try {
      const updatedReminder = await this.prisma.reminder.update({
        where: {
          id: reminderId,
        },
        data,
        include: {
          application: true,
        },
      });

      const oldStatus = reminder.status;
      const newStatus = updatedReminder.status;
      const isActive = (status: ReminderStatus) => status === ReminderStatus.ACTIVE;
      const jobId: string = (updatedReminder.jobId ?? '') as string;

      if (isActive(oldStatus) && isActive(newStatus) && jobId) {
        await this.emailProducer.removeReminderEmailJob(jobId);
        await this.emailProducer.addReminderEmailJob(updatedReminder.id);
      }

      if (isActive(oldStatus) && !isActive(newStatus) && jobId) {
        await this.emailProducer.removeReminderEmailJob(jobId);
      }

      if (!isActive(oldStatus) && isActive(newStatus)) {
        await this.emailProducer.addReminderEmailJob(updatedReminder.id);
      }

      return updatedReminder;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Reminder with id ${reminderId} not found`);
      }
      throw error;
    }
  }

  async delete(reminderId: string, userId: string) {
    const reminder = (await this.prisma.reminder.findUnique({
      where: {
        id: reminderId,
      },
      select: {
        jobId: true,
        application: {
          select: {
            userId: true,
          },
        },
      },
    })) as Prisma.ReminderGetPayload<{
      select: {
        jobId: true;
        application: {
          select: {
            userId: true;
          };
        };
      };
    }> | null;

    if (!reminder || reminder.application.userId !== userId) {
      throw new NotFoundException(`Reminder not found or access denied`);
    }

    const deletedReminder = await this.prisma.reminder.delete({
      where: {
        id: reminderId,
      },
    });

    await this.emailProducer.removeReminderEmailJob(reminder.jobId as string);

    return deletedReminder;
  }

  async findAllByApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: { userId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException('Application of reminders not found or access denied');
    }

    return await this.prisma.reminder.findMany({
      where: { applicationId },
    });
  }

  async findAll(userId: string, sortBy: ReminderSortType, statusFilter: ReminderStatusFilter) {
    const orderDirection = sortBy === ReminderSortType.NEWEST ? 'desc' : 'asc';

    return await this.prisma.reminder.findMany({
      where: {
        application: {
          userId,
        },
        ...(statusFilter !== ReminderStatusFilter.ALL && {
          status:
            statusFilter === ReminderStatusFilter.ACTIVE
              ? ReminderStatusFilter.ACTIVE
              : statusFilter === ReminderStatusFilter.STOPPED
                ? ReminderStatusFilter.STOPPED
                : ReminderStatusFilter.DONE,
        }),
      },
      include: {
        application: {
          select: {
            jobTitle: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        alarmDate: orderDirection,
      },
    });
  }
}
