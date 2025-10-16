import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('interviews')
@ApiBearerAuth()
@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateInterviewDto) {
    return this.interviewService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') interviewId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateInterviewDto
  ) {
    return this.interviewService.update(interviewId, user.id, dto);
  }

  @Get('application/:applicationId')
  findAllByApplication(@Param('applicationId') applicationId: string, @CurrentUser() user: AuthUser) {
    return this.interviewService.findAllByApplication(applicationId, user.id);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.interviewService.findAll(user.id);
  }
}
