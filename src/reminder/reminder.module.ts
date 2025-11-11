import { Module } from '@nestjs/common';
import { ReminderController } from './reminder.controller';
import { ReminderService } from './reminder.service';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [QueuesModule],
  controllers: [ReminderController],
  providers: [ReminderService],
  exports: [ReminderService]
})
export class ReminderModule {}
