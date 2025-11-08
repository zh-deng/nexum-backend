import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompanyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateCompanyDto) {
    // Upsert used to avoid race conditions of multiple requests at the same time
    return await this.prisma.company.upsert({
      where: {
        name_userId: {
          name: data.name,
          userId,
        },
      },
      update: {},
      create: {
        ...data,
        userId,
      },
    });
  }

  async update(companyId: string, userId: string, data: UpdateCompanyDto) {
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        userId,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company not found or access denied`);
    }

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

  async findAll(userId: string) {
    return await this.prisma.company.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
}
