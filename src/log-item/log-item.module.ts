import { Module } from "@nestjs/common";
import { LogItemController } from "./log-item.controller";
import { LogItemService } from "./log-item.service";
import { PrismaService } from "../../prisma/prisma.service";

@Module({
  controllers: [LogItemController],
  providers: [LogItemService, PrismaService]
})

export class LogItemModule {}