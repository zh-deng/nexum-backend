import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReminderStatus } from '../../types/enums';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  applicationId: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  alarmDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ enum: ReminderStatus })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;
}
