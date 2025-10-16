import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dtos/create-reminder.dto';
import { UpdateReminderDto } from './dtos/update-reminder.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReminderService {
  constructor(private prisma: PrismaService) {}

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
    return await this.prisma.reminder.create({
      data,
    });
  }

  async update(reminderId: string, userId: string, data: UpdateReminderDto) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: data.applicationId,
      },
      select: { userId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException(`Application of reminder not found or access denied`);
    }

    try {
      return await this.prisma.reminder.update({
        where: {
          id: reminderId,
        },
        data,
        include: {
          application: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Reminder with id ${reminderId} not found`);
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
      throw new NotFoundException('Application of reminders not found or access denied');
    }

    return await this.prisma.reminder.findMany({
      where: { applicationId },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.reminder.findMany({
      where: {
        application: {
          userId,
        },
      },
      include: {
        application: true,
      },
      orderBy: {
        alarmDate: 'asc',
      },
    });
  }
}
