import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateApplicationDto) {
    const { company, logItemDate, ...applicationdata } = data;

    // Upsert to avoid race conditions of multiple requests at the same time
    const companyRecord = await this.prisma.company.upsert({
      where: {
        name_userId: {
          name: company.name,
          userId,
        },
      },
      update: {},
      create: {
        ...company,
        userId,
      },
    });

    return await this.prisma.application.create({
      data: {
        ...applicationdata,
        userId,
        companyId: companyRecord.id,
        logItems: {
          create: {
            status: applicationdata.status || 'DRAFT',
            date: new Date(logItemDate),
          },
        },
      },
      include: {
        company: true,
        logItems: true,
      },
    });
  }

  async update(applicationId: string, userId: string, data: UpdateApplicationDto) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: { userId: true, companyId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException(`Application not found or access denied`);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { company, companyId, userId: dtoUserId, ...applicationData } = data;

    // Catch error if there is no application with this id
    try {
      let companyRelation:
        | Prisma.CompanyUpdateOneRequiredWithoutApplicationsNestedInput
        | undefined;

      if (company && company.id) {
        const updateData = {
          name: company.name,
          website: company.website,
          street: company.street,
          city: company.city,
          state: company.state,
          zipCode: company.zipCode,
          country: company.country,
          industry: company.industry,
          companySize: company.companySize,
          contactName: company.contactName,
          contactEmail: company.contactEmail,
          contactPhone: company.contactPhone,
          notes: company.notes,
          logoUrl: company.logoUrl,
        };

        if (company.id === application.companyId) {
          // Same company, update existing record
          companyRelation = { update: updateData };
        } else {
          // Different company, connect to the new one and update its fields
          companyRelation = {
            connect: { id: company.id },
            update: updateData,
          };
        }
      }

      const payload = {
        ...applicationData,
        ...(companyRelation && { company: companyRelation }),
      };

      return this.prisma.application.update({
        where: { id: applicationId },
        data: payload,
        include: { company: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Application with id ${applicationId} not found`);
      }
      throw error;
    }
  }

  async toggleFavorite(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: { userId: true, favorited: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException(`Application not found or access denied`);
    }

    return await this.prisma.application.update({
      where: { id: applicationId },
      data: { favorited: !application.favorited },
      select: { id: true, favorited: true },
    });
  }

  async delete(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: { userId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException(`Application not found or access denied`);
    }

    return await this.prisma.application.delete({
      where: {
        id: applicationId,
      },
    });
  }

  async findAll(userId: string) {
    return await this.prisma.application.findMany({
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
