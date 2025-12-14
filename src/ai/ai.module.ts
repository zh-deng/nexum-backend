import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { HttpModule } from "@nestjs/axios";
import { FastApiClient } from "./fastapi.client";


@Module({
  imports: [
    HttpModule.register({
      timeout: 30_000,
      maxRedirects: 5,
    })
  ],
  controllers: [AiController],
  providers: [AiService, FastApiClient]
})

export class AiModule {}