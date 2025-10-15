import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateLogItemDto } from './dtos/create-log-item.dto';
import { UpdateLogItemDto } from './dtos/update-log-item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class LogItemService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateLogItemDto) {
    return await this.prisma.logItem.create({
      data,
    });
  }

  async update(logItemId: string, data: UpdateLogItemDto) {
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

  async findAll(applicationId: string) {
    return await this.prisma.logItem.findMany({
      where: {
        applicationId,
      },
    });
  }
}
