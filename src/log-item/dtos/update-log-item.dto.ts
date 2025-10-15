import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApplicationStatus } from "../../types/enums";

export class UpdateLogItemDto {
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  applicationId?: string
}