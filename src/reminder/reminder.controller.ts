import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dtos/create-reminder.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateReminderDto } from './dtos/update-reminder.dto';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';

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

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.reminderService.findAll(user.id);
  }
}
