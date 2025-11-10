import { IsDate, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  applicationId: string;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  alarmDate: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;
}
