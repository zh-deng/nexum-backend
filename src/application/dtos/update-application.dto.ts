import { IsArray, IsEnum, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Priority, WorkLocation } from '../../types/enums';
import { ApplicationStatus } from '@prisma/client';
import { UpdateCompanyDto } from '../../company/dtos/update-company.dto';
import { Type } from 'class-transformer';

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCompanyDto)
  company?: UpdateCompanyDto;

  @IsOptional()
  @IsString()
  jobLink?: string;

  @IsOptional()
  @IsString()
  jobDescription?: string;

  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fileUrls?: string[];
}
