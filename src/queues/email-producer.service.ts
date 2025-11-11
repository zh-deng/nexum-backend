import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { scheduleAt } from '../utils/helpers';
import { Reminder } from '@prisma/client';

@Injectable()
export class EmailProducerService {
  constructor(@InjectQueue('email') private readonly emailQueue: Queue) {}

  async addReminderEmailJob(reminder: Reminder,) {
    const reminderJob = await this.emailQueue.add('sendReminderEmail', reminder, {
      delay: scheduleAt(reminder.alarmDate),
    });

    
  }
}
