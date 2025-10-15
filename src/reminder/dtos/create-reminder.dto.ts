import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReminderStatus } from '../../types/enums';
import { Type } from 'class-transformer';

export class CreateReminderDto {
  @Type(() => Date)
  @IsDate()
  alarmDate: Date;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsString()
  applicationId: string;
}
