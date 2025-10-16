import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateApplicationDto) {
    return this.applicationService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') applicationId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateApplicationDto
  ) {
    return this.applicationService.update(applicationId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.applicationService.findAll(user.id);
  }
}
