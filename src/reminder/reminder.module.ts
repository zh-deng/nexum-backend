import { Module } from "@nestjs/common";
import { ReminderController } from "./reminder.controller";
import { ReminderService } from "./reminder.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [ReminderController],
  providers: [ReminderService, PrismaService]
})

export class ReminderModule {}