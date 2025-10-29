import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../../types/enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLogItemDto {
  @ApiProperty()
  @IsString()
  applicationId: string;

  @ApiProperty({ enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  date: Date;
}
