import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { ApplicationStatus, InterviewStatus, Prisma } from '@prisma/client';
import { InterviewSortType, InterviewStatusFilter } from '../types/enums';

@Injectable()
export class InterviewService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateInterviewDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: data.applicationId },
      select: {
        userId: true,
      },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException('Application of interview not found or access denied');
    }

    return await this.prisma.interview.create({
      data,
    });
  }

  async update(interviewId: string, userId: string, data: UpdateInterviewDto) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        applicationId: true,
        date: true,
        notes: true,
        application: {
          select: { userId: true },
        },
      },
    });

    if (!interview || interview.application.userId !== userId) {
      throw new NotFoundException(`Interview not found or access denied`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const interviewDate = data.date ?? interview.date;
        const isFuture = interviewDate && interviewDate.getTime() > Date.now();
        const interviewStatus = isFuture ? InterviewStatus.UPCOMING : InterviewStatus.DONE;

        // Update the interview itself
        const updatedInterview = await tx.interview.update({
          where: { id: interviewId },
          data: {
            date: interviewDate,
            status: interviewStatus,
            notes: data.notes ?? interview.notes,
          },
          include: {
            application: true,
          },
        });

        // Find the related log item
        const relatedLogItem = await tx.logItem.findFirst({
          where: {
            applicationId: interview.applicationId,
            date: interview.date!,
            status: ApplicationStatus.INTERVIEW,
          },
        });

        await tx.logItem.update({
          where: { id: relatedLogItem!.id },
          data: {
            date: updatedInterview.date!,
            notes: updatedInterview.notes,
          },
        });

        return updatedInterview;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Interview with id ${interviewId} not found`);
      }
      throw error;
    }
  }

  async delete(interviewId: string, userId: string) {
    const interview = await this.prisma.interview.findUnique({
      where: { id: interviewId },
      select: {
        applicationId: true,
        date: true,
        application: {
          select: { userId: true },
        },
      },
    });

    if (!interview || interview.application.userId !== userId) {
      throw new NotFoundException(`Interview not found or access denied`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // Find related log item before deleting the interview
        const relatedLogItem = await tx.logItem.findFirst({
          where: {
            applicationId: interview.applicationId,
            date: interview.date!,
            status: ApplicationStatus.INTERVIEW,
          },
          select: { id: true },
        });

        // 🔹 Delete the interview
        const deletedInterview = await tx.interview.delete({
          where: { id: interviewId },
          include: { application: true },
        });

        // 🔹 Delete the related log item
        if (relatedLogItem) {
          await tx.logItem.delete({
            where: { id: relatedLogItem.id },
          });

          // Check if there are any remaining log items for this application
          const logItemCount = await tx.logItem.count({
            where: { applicationId: interview.applicationId },
          });

          // If none left, create a DRAFT log item
          if (logItemCount === 0) {
            await tx.logItem.create({
              data: {
                applicationId: interview.applicationId,
                status: ApplicationStatus.DRAFT,
                date: new Date(),
              },
            });

            await tx.application.update({
              where: {
                id: interview.applicationId,
              },
              data: {
                status: ApplicationStatus.DRAFT,
              },
            });
          }
        }

        return deletedInterview;
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException(`Interview with id ${interviewId} not found`);
      }
      throw error;
    }
  }

  async findAllByApplication(applicationId: string, userId: string) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      select: { userId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException('Application of interviews not found or access denied');
    }

    return await this.prisma.interview.findMany({
      where: { applicationId },
    });
  }

  async findAll(userId: string, sortBy: InterviewSortType, statusFilter: InterviewStatusFilter) {
    const orderDirection = sortBy === InterviewSortType.NEWEST ? 'desc' : 'asc';

    return await this.prisma.interview.findMany({
      where: {
        application: { userId },
        ...(statusFilter !== InterviewStatusFilter.ALL && {
          status:
            statusFilter === InterviewStatusFilter.UPCOMING
              ? InterviewStatus.UPCOMING
              : InterviewStatus.DONE,
        }),
      },
      include: {
        application: {
          select: {
            jobTitle: true,
            company: { select: { name: true } },
          },
        },
      },
      orderBy: { date: orderDirection },
    });
  }
}
