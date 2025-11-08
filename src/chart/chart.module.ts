import { Module } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ChartController } from "./chart.controller";
import { ChartService } from "./chart.service";

@Module({
  controllers: [ChartController],
  providers: [ChartService, PrismaService]
})

export class ChartModule {
  
}