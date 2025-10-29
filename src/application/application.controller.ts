import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SortType } from '../types/enums';

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

  @Patch(':id/favorite')
  toggleFavorite(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.applicationService.toggleFavorite(id, user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.applicationService.delete(id, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('q') searchQuery?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('sortBy') sortBy?: string
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);

    return this.applicationService.findAll(user.id, {
      searchQuery,
      status,
      page: pageNum,
      limit: limitNum,
      sortBy: sortBy || SortType.DATE_NEW,
    });
  }
}
