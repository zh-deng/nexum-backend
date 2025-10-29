import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { WorkLocation } from '../../types/enums';
import { UpdateCompanyDto } from '../../company/dtos/update-company.dto';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateApplicationDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companyId?: string;

  @ApiPropertyOptional({ type: () => UpdateCompanyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateCompanyDto)
  company?: UpdateCompanyDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobDescription?: string;

  @ApiPropertyOptional({ enum: WorkLocation })
  @IsOptional()
  @IsEnum(WorkLocation)
  workLocation?: WorkLocation;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  favorited?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  fileUrls?: string[];
}
