import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../types/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLogItemDto {
  @ApiProperty()
  @IsString()
  applicationId: string;

  @ApiPropertyOptional({ enum: ApplicationStatus })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
