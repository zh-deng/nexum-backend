import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Prisma, Reminder, ReminderStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { MailService } from '../mail/mail.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  constructor(
    private prisma: PrismaService,
    private readonly mailService: MailService
  ) {
    super();
  }

  async process(job: Job<Reminder>) {
    const reminder = await this.prisma.reminder.findUnique({
      where: {
        id: job.data.id,
      },
      include: {
        application: {
          select: {
            company: {
              select: {
                name: true,
              },
            },
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!reminder) {
      throw new NotFoundException(`Reminder not found or access denied`);
    }

    try {
      await this.prisma.reminder.update({
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

      await this.mailService.sendMail({
        to: reminder.application.user.email,
        subject: `Interview Reminder for ${reminder.application.company.name}`,
        text: reminder.message ?? 'No message',
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Reminder with id ${reminder.id} not found`);
      }
      throw error;
    }
  }
}