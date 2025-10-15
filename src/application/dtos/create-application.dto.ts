import { IsArray, IsEnum, IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { ApplicationStatus, Priority, WorkLocation } from '../../types/enums';
import { CreateCompanyDto } from '../../company/dtos/create-company.dto';
import { Type } from 'class-transformer';

export class CreateApplicationDto {
  @IsString()
  jobTitle: string;

  @ValidateNested()
  @Type(() => CreateCompanyDto)
  company: CreateCompanyDto;

  @IsOptional()
  @IsString()
  jobLink?: string;

  @IsOptional()
  @IsString()
  jobDescription?: string;

  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @IsArray()
  @IsUrl({}, { each: true })
  fileUrls: string[];
}
