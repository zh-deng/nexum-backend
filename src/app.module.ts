import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ReminderModule } from './reminder/reminder.module';
import { LogItemModule } from './log-item/log-item.module';
import { InterviewModule } from './interview/interview.module';
import { CompanyModule } from './company/company.module';
import { ApplicationModule } from './application/application.module';
import { ChartModule } from './chart/chart.module';
import { QueuesModule } from './queues/queues.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ApplicationModule,
    ReminderModule,
    LogItemModule,
    InterviewModule,
    CompanyModule,
    ChartModule,
    QueuesModule,
    PrismaModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
