import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Inserts demo data so you can see the app working immediately.
async function main(): Promise<void> {
  // 1. Create a demo company
  const company = await prisma.company.create({
    data: { name: "Acme Trading Co." },
  });

  console.log("Created company:", company.name);

  // 2. Create categories for this company
  const electronics = await prisma.category.create({
    data: { companyId: company.id, name: "Electronics" },
  });

  const officeSupplies = await prisma.category.create({
    data: { companyId: company.id, name: "Office Supplies" },
  });

  const furniture = await prisma.category.create({
    data: { companyId: company.id, name: "Furniture" },
  });

  console.log("Created 3 categories");

  // 3. Create products (SKUs in uppercase for consistent uniqueness)
  await prisma.product.createMany({
    data: [
      {
        companyId: company.id,
        name: "Wireless Mouse",
        sku: "ELEC-001",
        categoryId: electronics.id,
        unit: "piece",
        costPrice: 350.0,
        sellingPrice: 599.0,
        lowStockLevel: 10,
      },
      {
        companyId: company.id,
        name: "USB-C Hub",
        sku: "ELEC-002",
        categoryId: electronics.id,
        unit: "piece",
        costPrice: 800.0,
        sellingPrice: 1299.0,
        lowStockLevel: 5,
      },
      {
        companyId: company.id,
        name: "A4 Copy Paper (Ream)",
        sku: "OFFC-001",
        categoryId: officeSupplies.id,
        unit: "ream",
        costPrice: 180.0,
        sellingPrice: 250.0,
        lowStockLevel: 20,
      },
      {
        companyId: company.id,
        name: "Ballpoint Pen (Box of 12)",
        sku: "OFFC-002",
        categoryId: officeSupplies.id,
        unit: "box",
        costPrice: 95.0,
        sellingPrice: 150.0,
        lowStockLevel: 15,
      },
      {
        companyId: company.id,
        name: "Office Desk",
        sku: "FURN-001",
        categoryId: furniture.id,
        unit: "piece",
        costPrice: 4500.0,
        sellingPrice: 6999.0,
        lowStockLevel: 3,
      },
    ],
  });

  console.log("Created 5 products");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
