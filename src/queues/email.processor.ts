import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Prisma, Reminder, ReminderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job<Reminder>) {
    const reminder = await this.prisma.reminder.findUnique({
      where: {
        id: job.data.id,
      },
    });

    if (!reminder) {
      throw new NotFoundException(`Reminder not found or access denied`);
    }

    try {
      const updatedReminder = await this.prisma.reminder.update({
        where: {
          id: reminder.id,
        },
        data: {
          status: ReminderStatus.DONE,
        },
        include: {
          application: true,
        },
      });

      console.log('Old job:', job.data);
      console.log('New job:', updatedReminder);

      // return updatedReminder;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Reminder with id ${reminder.id} not found`);
      }
      throw error;
    }
  }
}
