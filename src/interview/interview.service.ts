import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewDto } from './dtos/create-interview.dto';
import { UpdateInterviewDto } from './dtos/update-interview.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InterviewService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateInterviewDto) {
    return await this.prisma.interview.create({
      data,
    });
  }

  async update(interviewId: string, data: UpdateInterviewDto) {
    try {
      return await this.prisma.interview.update({
        where: { id: interviewId },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error(`Interview with id ${interviewId} not found`);
      }
      throw error;
    }
  }

  async findAll(applicationId: string) {
    return await this.prisma.interview.findMany({
      where: { applicationId },
    });
  }
}
