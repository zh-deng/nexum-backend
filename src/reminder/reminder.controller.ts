import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dtos/create-reminder.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateReminderDto } from './dtos/update-reminder.dto';

@ApiTags('reminders')
@ApiBearerAuth()
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  create(@Body() dto: CreateReminderDto) {
    return this.reminderService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') reminderId: string, @Body() dto: UpdateReminderDto) {
    return this.reminderService.update(reminderId, dto);
  }

  @Get()
  findAll(@Body() applicationId: string) {
    return this.reminderService.findAll(applicationId);
  }
}
