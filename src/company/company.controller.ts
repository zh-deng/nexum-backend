import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('companies')
@ApiBearerAuth()
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') companyId: string, @Body() dto: UpdateCompanyDto) {
    return this.companyService.update(companyId, dto);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }
}
