import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dtos/create-reminder.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('reminders')
@ApiBearerAuth()
@Controller('reminders')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  create(@Body() dto: CreateReminderDto) {
    return this.reminderService.create(dto);
  }

  @Get()
  findAll(@Body() applicationId: string) {
    return this.reminderService.findAll(applicationId);
  }
}
