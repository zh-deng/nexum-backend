import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { Prisma } from '@prisma/client';

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
    const application = await this.prisma.application.findUnique({
      where: {
        id: data.applicationId,
      },
      select: { userId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException(`Application of interview not found or access denied`);
    }

    try {
      return await this.prisma.interview.update({
        where: { id: interviewId },
        data,
        include: {
          application: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error(`Interview with id ${interviewId} not found`);
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

  async findAll(userId: string) {
    return await this.prisma.interview.findMany({
      where: {
        application: {
          userId,
        },
      },
      include: {
        application: true,
      },
      orderBy: {
        date: 'asc',
      },
    });
  }
}
