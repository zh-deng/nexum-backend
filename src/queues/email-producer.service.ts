import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
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
      where: { id: reminderId },
      include: {
        application: {
          select: {
            user: {
              select: { email: true, id: true },
            },
          },
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found or access denied');
    }

    // If a demo user email is configured, skip creating jobs for that user to avoid background work.
    const demoEmail = process.env.DEMO_USER_EMAIL;
    const ownerEmail = reminder.application?.user?.email;
    if (demoEmail && ownerEmail && demoEmail === ownerEmail) {
      // Return the reminder without enqueueing a job or setting a jobId.
      return reminder;
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
