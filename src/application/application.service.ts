import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { UpdateApplicationDto } from './dtos/update-application.dto';
import { Prisma } from '@prisma/client';
import { ApplicationStatus, SortType } from '../types/enums';
import { getComplexSortDirection, requiresComplexDateSort, sortApplicationsByDateComplex } from '../utils/application-sorter.helpers';

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

async findAll(
  userId: string,
  options: {
    searchQuery?: string;
    status?: string;
    page: number;
    limit: number;
    sortBy?: string;
  }
) {
  const { searchQuery, status, page, limit, sortBy = SortType.DATE_NEW } = options;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.ApplicationWhereInput = { userId };

  if (searchQuery && searchQuery.trim()) {
    where.OR = [
      { jobTitle: { contains: searchQuery, mode: 'insensitive' } },
      {
        company: {
          is: {
            name: { contains: searchQuery, mode: 'insensitive' },
          },
        },
      },
      {
        company: {
          is: {
            city: { contains: searchQuery, mode: 'insensitive' },
          },
        },
      },
    ];
  }

  // Add status filter if provided
  if (status !== 'ALL') {
    where.status = status as ApplicationStatus;
  }

  // Determine if we need complex sorting
  const needsComplexSort = requiresComplexDateSort(sortBy);

  // Build orderBy clause based on sortBy
  const orderBy: Prisma.ApplicationOrderByWithRelationInput[] = [];

  if (needsComplexSort) {
    // For complex date sorting, we'll fetch all matching records and sort in memory
    // Use a basic order to ensure consistent results
    orderBy.push({ id: 'asc' });
  } else {
    // Standard Prisma-level sorting
    switch (sortBy as SortType) {
      case SortType.ALPHABETICAL_TITLE:
        orderBy.push({ jobTitle: 'asc' });
        break;
      case SortType.ALPHABETICAL_COMPANY:
        orderBy.push({ company: { name: 'asc' } });
        break;
      case SortType.PRIORITY:
        orderBy.push({ priority: 'asc' });
        break;
      default:
        orderBy.push({ updatedAt: 'desc' });
        break;
    }
  }

  // For complex sorting, we need to fetch all records, sort them, then paginate
  // For simple sorting, we can paginate at the database level
  let applications;
  let total;

  if (needsComplexSort) {
    // Fetch all matching applications (without pagination)
    const [allApplications, totalCount] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          company: true,
          reminders: true,
          interviews: true,
          logItems: true,
        },
        orderBy,
      }),
      this.prisma.application.count({ where }),
    ]);

    total = totalCount;

    // Apply complex sorting
    const sortDirection = getComplexSortDirection(sortBy);
    const sortedApplications = sortApplicationsByDateComplex(
      allApplications,
      sortDirection
    );

    // Apply pagination in memory
    applications = sortedApplications.slice(skip, skip + limit);
  } else {
    // Standard Prisma pagination
    [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          company: true,
          reminders: true,
          interviews: true,
          logItems: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.application.count({ where }),
    ]);
  }

  const totalPages = Math.ceil(total / limit);

  return {
    data: applications,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
}
