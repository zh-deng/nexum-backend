import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.companyService.create(dto);
  }

  @Patch()
  update(@Param() companyId: string, dto: UpdateCompanyDto) {
    return this.companyService.update(companyId, dto);
  }

  @Get()
  findAll() {
    return this.companyService.findAll();
  }
}
