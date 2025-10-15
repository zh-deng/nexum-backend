import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateApplicationDto) {
    const { company, ...applicationdata } = data;

    const companyRecord = await this.prisma.company.upsert({
      where: { name: company.name },
      update: {},
      create: company,
    });

    return this.prisma.application.create({
      data: {
        ...applicationdata,
        userId,
        companyId: companyRecord.id,
      },
      include: {
        company: true,
      },
    });
  }

  async update(applicationId: string, data: UpdateApplicationDto) {
    const { company, ...applicationData } = data;

    // Catch error if there is no application with this id
    try {
      return this.prisma.application.update({
        where: {
          id: applicationId,
        },
        data: {
          ...applicationData,
          ...(company && {
            company: {
              update: company,
            },
          }),
        },
        include: {
          company: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Application with id ${applicationId} not found`);
      }
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.prisma.application.findMany({
      where: { userId },
      include: {
        company: true,
        reminders: true,
        interviews: true,
        logItems: true,
      },
    });
  }
}
