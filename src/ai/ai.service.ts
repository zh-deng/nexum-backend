import { Injectable } from '@nestjs/common';
import { FastApiClient } from './fastapi.client';
import { ExtractJobInfoDto } from './dtos/extract-job-info.dto';
import { ExtractJobInfoResultDto } from './dtos/extract-job-info-result.dto';

@Injectable()
export class AiService {
  constructor(private readonly fastApiClient: FastApiClient) {}

  async extractJobInfo(data: ExtractJobInfoDto) {
    const aiResult = await this.fastApiClient.request<ExtractJobInfoResultDto, ExtractJobInfoDto>('/mcp/jobs/extract-info', {
      data: data,
    });

    return aiResult;
  }
}
