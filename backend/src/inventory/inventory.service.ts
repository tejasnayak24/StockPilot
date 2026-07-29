import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateLimitsDto } from './dto/update-limits.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: InventoryQueryDto) {
    const { page = 1, limit = 10, search, lowStock } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.product = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { barcode: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    if (lowStock) {
      // Find inventories where quantity <= minimumStock manually or via DB filter
      // Safe, cross-version portable approach:
      const inventories = await this.prisma.inventory.findMany({
        select: { id: true, quantity: true, minimumStock: true },
      });

      const lowStockIds = inventories
        .filter(inv => inv.quantity <= inv.minimumStock)
        .map(inv => inv.id);

      where.id = { in: lowStockIds };
    }

    const [total, data] = await Promise.all([
      this.prisma.inventory.count({ where }),
      this.prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        include: {
          product: {
            include: {
              category: true,
              supplier: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
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
    const inventory = await this.prisma.inventory.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            category: true,
            supplier: true,
          },
        },
      },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory record not found');
    }
    return inventory;
  }

  async findByProductId(productId: string) {
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId },
      include: {
        product: {
          include: {
            category: true,
            supplier: true,
          },
        },
      },
    });
    if (!inventory) {
      throw new NotFoundException('Inventory record not found for this product');
    }
    return inventory;
  }

  async updateLimits(productId: string, dto: UpdateLimitsDto) {
    // Verify inventory exists
    const inventory = await this.findByProductId(productId);

    if (dto.maximumStock !== undefined && dto.maximumStock < dto.minimumStock) {
      throw new BadRequestException('Maximum stock cannot be less than minimum stock');
    }

    return this.prisma.inventory.update({
      where: { id: inventory.id },
      data: {
        minimumStock: dto.minimumStock,
        maximumStock: dto.maximumStock,
      },
      include: {
        product: true,
      },
    });
  }

  async adjustStock(productId: string, dto: AdjustStockDto, userId: string) {
    const inventory = await this.findByProductId(productId);
    const currentQty = inventory.quantity;
    let newQty = currentQty;
    let delta = 0;

    if (dto.type === 'STOCK_IN') {
      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0 for STOCK_IN');
      }
      delta = dto.quantity;
      newQty = currentQty + delta;
    } else if (dto.type === 'STOCK_OUT') {
      if (dto.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0 for STOCK_OUT');
      }
      delta = -dto.quantity;
      newQty = currentQty + delta;
      if (newQty < 0) {
        throw new BadRequestException(`Insufficient stock. Current stock is ${currentQty}, cannot subtract ${dto.quantity}`);
      }
    } else if (dto.type === 'ADJUSTMENT') {
      if (dto.isOverride) {
        if (dto.quantity < 0) {
          throw new BadRequestException('Override quantity cannot be negative');
        }
        newQty = dto.quantity;
        delta = newQty - currentQty;
      } else {
        delta = dto.quantity;
        newQty = currentQty + delta;
        if (newQty < 0) {
          throw new BadRequestException(`Insufficient stock. Current stock is ${currentQty}, cannot adjust by ${dto.quantity}`);
        }
      }
    }

    // Validate maximum stock if set
    if (inventory.maximumStock !== null && newQty > inventory.maximumStock) {
      throw new BadRequestException(`New quantity (${newQty}) exceeds the maximum stock limit (${inventory.maximumStock})`);
    }

    // Execute in transaction
    return this.prisma.$transaction(async (tx) => {
      const updatedInventory = await tx.inventory.update({
        where: { id: inventory.id },
        data: { quantity: newQty },
        include: { product: true },
      });

      await tx.stockTransaction.create({
        data: {
          inventoryId: inventory.id,
          createdById: userId,
          type: dto.type,
          quantity: delta,
          remarks: dto.remarks || `Stock adjustment. Delta: ${delta}`,
        },
      });

      return updatedInventory;
    });
  }
}
