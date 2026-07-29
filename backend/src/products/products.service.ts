import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    // Validate category exists and is active
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category || !category.isActive) {
      throw new BadRequestException('Category not found or is inactive');
    }

    // Validate supplier exists and is active
    const supplier = await this.prisma.supplier.findUnique({
      where: { id: dto.supplierId },
    });
    if (!supplier || !supplier.isActive) {
      throw new BadRequestException('Supplier not found or is inactive');
    }

    // Determine SKU
    let sku = dto.sku;
    if (!sku) {
      sku = await this.generateUniqueSku(category.name, dto.name);
    } else {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku },
      });
      if (existingSku) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    // Validate barcode uniqueness if provided
    if (dto.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
      });
      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    // Create product and its initial inventory record
    return this.prisma.product.create({
      data: {
        name: dto.name,
        sku,
        barcode: dto.barcode,
        description: dto.description,
        costPrice: dto.costPrice,
        sellingPrice: dto.sellingPrice,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        supplierId: dto.supplierId,
        inventory: {
          create: {
            quantity: 0,
            minimumStock: dto.minimumStock ?? 10,
            maximumStock: dto.maximumStock,
          },
        },
      },
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 10, search, categoryId, supplierId, isActive, lowStock } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { barcode: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (supplierId) {
      where.supplierId = supplierId;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (lowStock) {
      // In Prisma, to compare two columns on the same model/relation dynamically:
      // We can check if quantity <= minimumStock.
      // If the version of Prisma doesn't support the Prisma.fields syntax, 
      // we can query the inventory table first, or use a prisma native filter.
      // A portable way is to find all inventories where quantity <= minimumStock,
      // and filter product by those productIds.
      const lowStockInventories = await this.prisma.inventory.findMany({
        where: {
          quantity: {
            lte: 10, // Default fallback
          },
        },
        select: { productId: true, quantity: true, minimumStock: true },
      });

      // Filter inventories manually to ensure correct comparison
      const lowStockProductIds = lowStockInventories
        .filter(inv => inv.quantity <= inv.minimumStock)
        .map(inv => inv.productId);

      where.id = { in: lowStockProductIds };
    }

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: true,
          supplier: true,
          inventory: true,
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
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.findOne(id);

    const updateData: any = { ...dto };

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category || !category.isActive) {
        throw new BadRequestException('Category not found or is inactive');
      }
    }

    if (dto.supplierId) {
      const supplier = await this.prisma.supplier.findUnique({
        where: { id: dto.supplierId },
      });
      if (!supplier || !supplier.isActive) {
        throw new BadRequestException('Supplier not found or is inactive');
      }
    }

    if (dto.sku && dto.sku !== product.sku) {
      const existingSku = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });
      if (existingSku) {
        throw new ConflictException('Product with this SKU already exists');
      }
    }

    if (dto.barcode && dto.barcode !== product.barcode) {
      const existingBarcode = await this.prisma.product.findUnique({
        where: { barcode: dto.barcode },
      });
      if (existingBarcode) {
        throw new ConflictException('Product with this barcode already exists');
      }
    }

    return this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Check if there are any transactions associated with this product's inventory
    const inventory = await this.prisma.inventory.findUnique({
      where: { productId: id },
    });

    if (inventory) {
      const transactionsCount = await this.prisma.stockTransaction.count({
        where: { inventoryId: inventory.id },
      });

      if (transactionsCount > 0) {
        // Soft delete by deactivating
        return this.prisma.product.update({
          where: { id },
          data: { isActive: false },
        });
      }
    }

    // Otherwise hard delete
    await this.prisma.product.delete({
      where: { id },
    });
    return { success: true };
  }

  private async generateUniqueSku(categoryName: string, productName: string): Promise<string> {
    const catCode = categoryName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase();
    const prodCode = productName
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 5)
      .toUpperCase();

    let isUnique = false;
    let sku = '';
    
    while (!isUnique) {
      const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
      sku = `${catCode}-${prodCode}-${randomCode}`;
      
      const existing = await this.prisma.product.findUnique({
        where: { sku },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    return sku;
  }
}
