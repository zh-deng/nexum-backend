import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { InterviewStatus } from '../../types/enums';
import { Type } from 'class-transformer';

export class UpdateInterviewDto {
  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;
}
