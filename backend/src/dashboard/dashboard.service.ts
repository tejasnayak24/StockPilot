import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    // 1. Fetch counts
    const [totalProducts, totalCategories, totalSuppliers, totalUsers] = await Promise.all([
      this.prisma.product.count({ where: { isActive: true } }),
      this.prisma.category.count({ where: { isActive: true } }),
      this.prisma.supplier.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { isActive: true } }),
    ]);

    // 2. Fetch all products and inventories to calculate stock values and stats
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      include: { inventory: true },
    });

    let totalCostValue = 0;
    let totalSellingValue = 0;
    let totalItemsInStock = 0;
    let lowStockCount = 0;

    const lowStockProductsList: any[] = [];

    for (const p of products) {
      if (p.inventory) {
        const qty = p.inventory.quantity;
        const minStock = p.inventory.minimumStock;
        
        totalItemsInStock += qty;
        totalCostValue += Number(p.costPrice) * qty;
        totalSellingValue += Number(p.sellingPrice) * qty;

        if (qty <= minStock) {
          lowStockCount++;
          if (lowStockProductsList.length < 5) {
            lowStockProductsList.push({
              id: p.id,
              name: p.name,
              sku: p.sku,
              quantity: qty,
              minimumStock: minStock,
            });
          }
        }
      }
    }

    // 3. Recent Transactions (limit 5)
    const recentTransactions = await this.prisma.stockTransaction.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
        createdBy: {
          select: {
            name: true,
          },
        },
      },
    });

    const formattedRecentTransactions = recentTransactions.map(tx => ({
      id: tx.id,
      productName: tx.inventory.product.name,
      sku: tx.inventory.product.sku,
      type: tx.type,
      quantity: tx.quantity,
      remarks: tx.remarks,
      operator: tx.createdBy.name,
      createdAt: tx.createdAt,
    }));

    // 4. Product distribution by Category
    const categoriesStats = await this.prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    const formattedCategoriesStats = categoriesStats.map(cat => ({
      name: cat.name,
      value: cat._count.products,
    }));

    // 5. Product distribution by Supplier
    const suppliersStats = await this.prisma.supplier.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    const formattedSuppliersStats = suppliersStats.map(sup => ({
      name: sup.name,
      value: sup._count.products,
    }));

    return {
      stats: {
        totalProducts,
        totalCategories,
        totalSuppliers,
        totalUsers,
        totalItemsInStock,
        totalCostValue: parseFloat(totalCostValue.toFixed(2)),
        totalSellingValue: parseFloat(totalSellingValue.toFixed(2)),
        lowStockProductsCount: lowStockCount,
      },
      lowStockAlerts: lowStockProductsList,
      recentTransactions: formattedRecentTransactions,
      categoryDistribution: formattedCategoriesStats,
      supplierDistribution: formattedSuppliersStats,
    };
  }
}
