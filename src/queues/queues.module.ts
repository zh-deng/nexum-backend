import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailProducerService } from './email-producer.service';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [EmailProducerService, EmailProcessor],
  exports: [BullModule, EmailProducerService],
})
export class QueuesModule {}