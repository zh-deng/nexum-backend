import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ChartService } from './chart.service';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { TimeFrameType } from '../types/enums';

@ApiTags('charts')
@ApiBearerAuth()
@Controller('charts')
export class ChartController {
  constructor(private readonly chartService: ChartService) {}

  @Get('pie/:timeFrame')
  getPieChartData(@CurrentUser() user: AuthUser, @Param('timeFrame') timeFrame: TimeFrameType) {
    return this.chartService.getPieChartData(user.id, timeFrame)
  }

  @Get('bar/:timeFrame')
  getBarChartData(@CurrentUser() user: AuthUser, @Param('timeFrame') timeFrame: TimeFrameType) {
    return this.chartService.getBarChartData(user.id, timeFrame)
  }

  @Get('sankey')
  getSankeyChartData(@CurrentUser() user: AuthUser, @Param('timeFrame') timeFrame: TimeFrameType) {
    return this.chartService.getSankeyChartData(user.id, timeFrame)
  }

}