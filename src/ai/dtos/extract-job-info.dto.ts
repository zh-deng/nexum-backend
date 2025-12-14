import { IsOptional, IsString } from 'class-validator';

export class ExtractJobInfoDto {
  @IsOptional()
  @IsString()
  jobLink?: string;

  @IsOptional()
  @IsString()
  jobDescription?: string;
}
