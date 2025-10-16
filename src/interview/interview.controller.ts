import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InterviewService } from './interview.service';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('interviews')
@ApiBearerAuth()
@Controller('interviews')
export class InterviewController {
  constructor(private readonly interviewService: InterviewService) {}

  @Post()
  create(@Body() dto: CreateInterviewDto) {
    return this.interviewService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') interviewId: string, @Body() dto: UpdateInterviewDto) {
    return this.interviewService.update(interviewId, dto);
  }

  @Get()
  findAll(@Body() applicationId: string) {
    return this.interviewService.findAll(applicationId);
  }
}
