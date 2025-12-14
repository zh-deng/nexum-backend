import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ExtractJobInfoDto } from './dtos/extract-job-info.dto';

@ApiTags('ai')
@ApiBearerAuth()
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extract-job-info')
  extractJobInfo(@Body() dto: ExtractJobInfoDto) {
    return this.aiService.extractJobInfo(dto);
  }
}
