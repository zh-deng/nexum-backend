import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailProducerService } from './email-producer.service';
import { EmailProcessor } from './email.processor';
import { MailModule } from '../mail/mail.module';

const redisUrl = new URL(process.env.REDIS_URL!);

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: redisUrl.hostname,
        port: Number(redisUrl.port),
        password: redisUrl.password,
        username: redisUrl.username,
      },
    }),
    BullModule.registerQueue({
      name: 'email',
    }),
    MailModule,
  ],
  providers: [EmailProducerService, EmailProcessor],
  exports: [BullModule, EmailProducerService],
})
export class QueuesModule {}
