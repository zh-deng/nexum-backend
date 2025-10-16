import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LogItemService } from './log-item.service';
import { CreateLogItemDto } from './dtos/create-log-item.dto';
import { UpdateLogItemDto } from './dtos/update-log-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('log-items')
@ApiBearerAuth()
@Controller('log-items')
export class LogItemController {
  constructor(private readonly logItemService: LogItemService) {}

  @Post()
  create(@Body() dto: CreateLogItemDto) {
    return this.logItemService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') logItemId: string, @Body() dto: UpdateLogItemDto) {
    return this.logItemService.update(logItemId, dto);
  }

  @Get()
  findAll(@Body() applicationId: string) {
    return this.logItemService.findAll(applicationId);
  }
}
