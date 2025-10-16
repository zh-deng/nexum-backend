import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../types/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLogItemDto {
  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty()
  @IsString()
  applicationId: string;
}
