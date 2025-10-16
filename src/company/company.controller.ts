import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { type AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateCompanyDto) {
    return this.companyService.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @Param('id') companyId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateCompanyDto
  ) {
    return this.companyService.update(companyId, user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.companyService.findAll(user.id);
  }
}
