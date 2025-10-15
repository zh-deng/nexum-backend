import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCompanyDto) {
    return await this.prisma.company.create({
      data,
    });
  }

  async update(companyId: string, data: UpdateCompanyDto) {
    try {
      return await this.prisma.company.update({
        where: {
          id: companyId,
        },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error(`Company with id ${companyId} not found`);
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.company.findMany({
      include: {
        applications: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
