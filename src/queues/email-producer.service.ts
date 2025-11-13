import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { scheduleAt } from '../utils/helpers';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EmailProducerService {
  constructor(
    @InjectQueue('email') private readonly emailQueue: Queue,
    private prisma: PrismaService
  ) {}

  async addReminderEmailJob(reminderId: string) {
    const reminder = await this.prisma.reminder.findUnique({
      where: {
        id: reminderId,
      },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found or access denied');
    }

    const reminderJob = await this.emailQueue.add('sendReminderEmail', reminder, {
      delay: scheduleAt(reminder.alarmDate),
    });

    const updatedReminder = await this.prisma.reminder.update({
      where: {
        id: reminder.id,
      },
      data: {
        jobId: reminderJob.id,
      },
    });

    return updatedReminder;
  }

  async removeReminderEmailJob(jobId: string) {
    const job = await this.emailQueue.getJob(jobId);

    if (!job) return;

    await job.remove();
  }
}
