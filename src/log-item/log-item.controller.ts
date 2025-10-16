import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LogItemService } from './log-item.service';
import { CreateLogItemDto } from './dtos/create-log-item.dto';
import { UpdateLogItemDto } from './dtos/update-log-item.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('log-items')
@ApiBearerAuth()
@Controller('log-items')
export class LogItemController {
  constructor(private readonly logItemService: LogItemService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateLogItemDto) {
    return this.logItemService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') logItemId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateLogItemDto
  ) {
    return this.logItemService.update(logItemId, user.id, dto);
  }

  @Get('application/:applicationId')
  findAllByApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.logItemService.findAllByApplication(applicationId, user.id);
  }
}
