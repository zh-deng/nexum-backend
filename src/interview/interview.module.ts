import { Module } from "@nestjs/common";
import { InterviewController } from "./interview.controller";
import { InterviewService } from "./interview.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [InterviewController],
  providers: [InterviewService, PrismaService]
})

export class InterviewModule {}