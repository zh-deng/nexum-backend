import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLogItemDto } from './dtos/create-log-item.dto';
import { UpdateLogItemDto } from './dtos/update-log-item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LogItemService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateLogItemDto) {
    const application = await this.prisma.application.findUnique({
      where: { id: data.applicationId },
      select: {
        userId: true,
      },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException('Application of log-item not found or access denied');
    }

    return await this.prisma.logItem.create({
      data,
    });
  }

  async update(logItemId: string, userId: string, data: UpdateLogItemDto) {
    const application = await this.prisma.application.findUnique({
      where: {
        id: data.applicationId,
      },
      select: { userId: true },
    });

    if (!application || application.userId !== userId) {
      throw new NotFoundException(`Application of log-item not found or access denied`);
    }

    try {
      return this.prisma.logItem.update({
        where: {
          id: logItemId,
        },
        data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new Error(`LogItem with id ${logItemId} not found`);
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
      throw new NotFoundException('Application of log-items not found or access denied');
    }

    return await this.prisma.logItem.findMany({
      where: {
        applicationId,
      },
    });
  }
}
