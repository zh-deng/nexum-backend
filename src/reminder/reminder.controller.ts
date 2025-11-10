import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dtos/create-reminder.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateReminderDto } from './dtos/update-reminder.dto';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReminderSortType, ReminderStatusFilter } from '../types/enums';

@ApiTags('reminders')
@ApiBearerAuth()
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReminderDto) {
    return this.reminderService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') reminderId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateReminderDto
  ) {
    return this.reminderService.update(reminderId, user.id, dto);
  }

  @Get('application/:applicationId')
  findAllByApplication(
    @Param('applicationId') applicationId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.reminderService.findAllByApplication(applicationId, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.reminderService.delete(id, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('sortBy') sortBy: ReminderSortType = ReminderSortType.NEWEST,
    @Query('statusFilter') statusFilter: ReminderStatusFilter = ReminderStatusFilter.ALL
  ) {
    return this.reminderService.findAll(user.id, sortBy, statusFilter);
  }
}
