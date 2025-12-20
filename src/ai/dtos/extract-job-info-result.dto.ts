import {
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WorkLocation } from '@prisma/client';
import { ExtractCompanyInfoResultDto } from './extract-company-info-result.dto';

export class ExtractJobInfoResultDto {
  @ApiPropertyOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional({ type: () => ExtractCompanyInfoResultDto })
  @ValidateNested()
  @Type(() => ExtractCompanyInfoResultDto)
  company?: ExtractCompanyInfoResultDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional({ enum: WorkLocation })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
