import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApplicationStatus } from "../../types/enums";

export class CreateLogItemDto {
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  applicationId: string
}