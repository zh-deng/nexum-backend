import { Module } from "@nestjs/common";
import { LogItemController } from "./log-item.controller";
import { LogItemService } from "./log-item.service";

@Module({
  controllers: [LogItemController],
  providers: [LogItemService]
})

export class LogItemModule {}
