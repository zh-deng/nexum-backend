import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../types/enums';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLogItemDto {
  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationId?: string;
}
