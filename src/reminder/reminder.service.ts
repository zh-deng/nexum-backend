import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dtos/create-reminder.dto';
import { UpdateReminderDto } from './dtos/update-reminder.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReminderService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateReminderDto) {
    return await this.prisma.reminder.create({
      data,
    });
  }

  async update(reminderId: string, data: UpdateReminderDto) {
    try {
      return await this.prisma.reminder.update({
        where: {
          id: reminderId,
        },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error(`Reminder with id ${reminderId} not found`);
      }
      throw error;
    }
  }

  async findAll(applicationId: string) {
    return await this.prisma.reminder.findMany({
      where: { applicationId },
    });
  }
}
