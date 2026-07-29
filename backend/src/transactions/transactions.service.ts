import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Injectable()
export class StockTransactionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: TransactionQueryDto) {
    const { page = 1, limit = 10, search, type, userId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.createdById = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // Extend to end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (search) {
      where.OR = [
        { remarks: { contains: search, mode: 'insensitive' } },
        {
          inventory: {
            product: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { sku: { contains: search, mode: 'insensitive' } },
                { barcode: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.stockTransaction.count({ where }),
      this.prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
        include: {
          inventory: {
            include: {
              product: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.stockTransaction.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });
    if (!transaction) {
      throw new NotFoundException('Transaction record not found');
    }
    return transaction;
  }
}
