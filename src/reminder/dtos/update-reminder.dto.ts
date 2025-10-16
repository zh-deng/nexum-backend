import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReminderStatus } from '../../types/enums';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReminderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  alarmDate?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({enum: ReminderStatus})
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationId?: string;
}
