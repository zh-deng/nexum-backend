import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';

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
