import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateApplicationDto } from './dtos/update-application.dto';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.applicationService.create(user.id, dto);
  }

  @Patch()
  update(@Param('id') applicationId: string, @Body() dto: UpdateApplicationDto) {
    return this.applicationService.update(applicationId, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.applicationService.findAll(user.id);
  }
}
