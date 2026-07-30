import { PrismaClient, Role, TransactionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database inside a single transaction...');
  
  const hashedPassword = await bcrypt.hash('password123', 10);

  await prisma.$transaction(async (tx) => {
    console.log('Clearing database tables...');
    await tx.stockTransaction.deleteMany({});
    await tx.inventory.deleteMany({});
    await tx.product.deleteMany({});
    await tx.supplier.deleteMany({});
    await tx.category.deleteMany({});
    await tx.user.deleteMany({});

    console.log('Creating users...');
    const admin = await tx.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@stockpilot.com',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    });

    const manager = await tx.user.create({
      data: {
        name: 'Manager User',
        email: 'manager@stockpilot.com',
        password: hashedPassword,
        role: Role.MANAGER,
      },
    });

    const staff = await tx.user.create({
      data: {
        name: 'Staff User',
        email: 'staff@stockpilot.com',
        password: hashedPassword,
        role: Role.STAFF,
      },
    });

    console.log('Creating categories...');
    const electronics = await tx.category.create({ data: { name: 'Electronics', description: 'Gadgets and devices' } });
    const officeSupplies = await tx.category.create({ data: { name: 'Office Supplies', description: 'Stationery and furniture' } });
    const apparel = await tx.category.create({ data: { name: 'Apparel', description: 'Clothing and footwear' } });
    const kitchenware = await tx.category.create({ data: { name: 'Kitchenware', description: 'Cookware and kitchen gadgets' } });

    console.log('Creating suppliers...');
    const apex = await tx.supplier.create({
      data: {
        name: 'Apex Tech Solutions',
        email: 'sales@apextech.com',
        phone: '+1-555-0100',
        address: '100 Silicon Way, San Jose, CA',
      },
    });

    const globalGoods = await tx.supplier.create({
      data: {
        name: 'Global Goods Inc',
        email: 'orders@globalgoods.com',
        phone: '+1-555-0200',
        address: '200 Logistics Blvd, Chicago, IL',
      },
    });

    const superiorApparel = await tx.supplier.create({
      data: {
        name: 'Superior Apparel Ltd',
        email: 'info@superiorapparel.com',
        phone: '+1-555-0300',
        address: '300 Garment St, New York, NY',
      },
    });

    console.log('Creating products and inventories...');
    const productsData = [
      {
        name: 'iPhone 15',
        sku: 'ELE-IPH15-B9A2',
        barcode: '190198066778',
        description: 'Apple iPhone 15 128GB Black',
        costPrice: 699.0,
        sellingPrice: 799.0,
        categoryId: electronics.id,
        supplierId: apex.id,
        quantity: 25,
        minimumStock: 10,
        maximumStock: 100,
      },
      {
        name: 'Logitech MX Master 3S Mouse',
        sku: 'ELE-MXM3S-F8D1',
        barcode: '097855171120',
        description: 'Ergonomic wireless mouse',
        costPrice: 85.0,
        sellingPrice: 99.0,
        categoryId: electronics.id,
        supplierId: apex.id,
        quantity: 3, // Low stock!
        minimumStock: 5,
        maximumStock: 30,
      },
      {
        name: 'Ergonomic Desk Chair',
        sku: 'OFF-CHAIR-E4C2',
        barcode: '810052345120',
        description: 'Mesh desk chair with lumbar support',
        costPrice: 120.0,
        sellingPrice: 180.0,
        categoryId: officeSupplies.id,
        supplierId: globalGoods.id,
        quantity: 12,
        minimumStock: 5,
        maximumStock: 40,
      },
      {
        name: 'Dry Erase Whiteboard',
        sku: 'OFF-WBOARD-W2K1',
        barcode: '034138012354',
        description: '4x3 magnetic whiteboard',
        costPrice: 35.0,
        sellingPrice: 49.0,
        categoryId: officeSupplies.id,
        supplierId: globalGoods.id,
        quantity: 1, // Low stock!
        minimumStock: 3,
        maximumStock: 15,
      },
      {
        name: 'Cotton Polo Shirt',
        sku: 'APP-POLO-P1B9',
        barcode: '723456789123',
        description: 'Classic fit cotton polo shirt',
        costPrice: 15.0,
        sellingPrice: 28.0,
        categoryId: apparel.id,
        supplierId: superiorApparel.id,
        quantity: 50,
        minimumStock: 15,
        maximumStock: 150,
      },
      {
        name: 'Running Sneakers',
        sku: 'APP-SNEAK-S9F2',
        barcode: '723456789456',
        description: 'Lightweight athletic running shoes',
        costPrice: 45.0,
        sellingPrice: 85.0,
        categoryId: apparel.id,
        supplierId: superiorApparel.id,
        quantity: 8, // Low stock!
        minimumStock: 10,
        maximumStock: 50,
      },
      {
        name: 'Stainless Steel Frying Pan',
        sku: 'KIT-FRYPN-F3A1',
        barcode: '850012345678',
        description: '12-inch tri-ply clad frying pan',
        costPrice: 28.0,
        sellingPrice: 45.0,
        categoryId: kitchenware.id,
        supplierId: globalGoods.id,
        quantity: 20,
        minimumStock: 8,
        maximumStock: 60,
      },
      {
        name: 'Electric Kettle',
        sku: 'KIT-EKETL-K4B2',
        barcode: '850012345690',
        description: '1.7L stainless steel electric tea kettle',
        costPrice: 18.0,
        sellingPrice: 29.0,
        categoryId: kitchenware.id,
        supplierId: globalGoods.id,
        quantity: 15,
        minimumStock: 6,
        maximumStock: 40,
      },
    ];

    for (const pd of productsData) {
      const product = await tx.product.create({
        data: {
          name: pd.name,
          sku: pd.sku,
          barcode: pd.barcode,
          description: pd.description,
          costPrice: pd.costPrice,
          sellingPrice: pd.sellingPrice,
          categoryId: pd.categoryId,
          supplierId: pd.supplierId,
          inventory: {
            create: {
              quantity: pd.quantity,
              minimumStock: pd.minimumStock,
              maximumStock: pd.maximumStock,
            },
          },
        },
        include: {
          inventory: true,
        },
      });

      if (product.inventory) {
        // 1. Initial Stock In
        const initialQty = Math.floor(pd.quantity * 1.2);
        await tx.stockTransaction.create({
          data: {
            inventoryId: product.inventory.id,
            createdById: admin.id,
            type: TransactionType.STOCK_IN,
            quantity: initialQty,
            remarks: 'Initial stock intake from vendor setup',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          },
        });

        // 2. Adjust or Stock Out to represent sales
        const salesQty = initialQty - pd.quantity;
        if (salesQty > 0) {
          await tx.stockTransaction.create({
            data: {
              inventoryId: product.inventory.id,
              createdById: manager.id,
              type: TransactionType.STOCK_OUT,
              quantity: -salesQty,
              remarks: 'Sales dispatch order',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            },
          });
        }
      }
    }
  }, { timeout: 30000 });

  console.log('Database successfully seeded inside transaction!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
