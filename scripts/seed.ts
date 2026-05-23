/**
 * Run: npx tsx scripts/seed.ts
 * Seeds admin user, branch, categories, brands, and sample products.
 */
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

function loadEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
const MONGODB_URI = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/pos_system";

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const { User } = await import("../src/models/User");
  const { Branch } = await import("../src/models/Branch");
  const { Category } = await import("../src/models/Category");
  const { Brand } = await import("../src/models/Brand");
  const { Product } = await import("../src/models/Product");
  const { Settings } = await import("../src/models/Settings");
  const { Role } = await import("../src/models/Role");

  const { Customer } = await import("../src/models/Customer");
  const { Supplier } = await import("../src/models/Supplier");

  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Category.deleteMany({}),
    Brand.deleteMany({}),
    Product.deleteMany({}),
    Settings.deleteMany({}),
    Role.deleteMany({}),
    Customer.deleteMany({}),
    Supplier.deleteMany({}),
  ]);

  const branch = await Branch.create({
    name: "Main Store",
    code: "MAIN",
    address: "123 Retail Street",
    phone: "+1 555-0100",
    isMain: true,
  });

  await Role.create({
    name: "Administrator",
    slug: "admin",
    permissions: [],
    isSystem: true,
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@pos.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin@123456";
  const hashed = await bcrypt.hash(adminPassword, 12);

  await User.create({
    name: "System Admin",
    email: adminEmail,
    password: hashed,
    role: "admin",
    branchId: branch._id,
    isActive: true,
  });

  await User.create({
    name: "Cashier Demo",
    email: "cashier@pos.local",
    password: await bcrypt.hash("Cashier@123", 12),
    role: "cashier",
    branchId: branch._id,
    isActive: true,
  });

  await Settings.create({
    storeName: "RetailPOS Demo Store",
    storeAddress: "123 Retail Street",
    storePhone: "+1 555-0100",
    currency: "USD",
    currencySymbol: "$",
    taxRate: 10,
    taxName: "VAT",
    branchId: branch._id,
  });

  const category = await Category.create({
    name: "General",
    slug: "general",
    branchId: branch._id,
  });

  const brand = await Brand.create({ name: "Generic", slug: "generic" });

  const products = [
    { name: "Wireless Mouse", price: 24.99, stock: 50, cost: 12 },
    { name: "USB-C Cable", price: 9.99, stock: 100, cost: 3 },
    { name: "Bluetooth Speaker", price: 49.99, stock: 25, cost: 25 },
    { name: "Phone Case", price: 14.99, stock: 80, cost: 5 },
    { name: "Screen Protector", price: 7.99, stock: 3, cost: 2 },
    { name: "Laptop Stand", price: 34.99, stock: 15, cost: 18 },
    { name: "HDMI Cable", price: 12.99, stock: 60, cost: 4 },
    { name: "Power Bank", price: 29.99, stock: 40, cost: 15 },
  ];

  for (const p of products) {
    const slug = p.name.toLowerCase().replace(/\s+/g, "-");
    const sku = `SKU-${slug.toUpperCase().slice(0, 8)}`;
    await Product.create({
      name: p.name,
      slug,
      sku,
      barcode: `${Date.now()}${Math.floor(Math.random() * 999)}`.slice(0, 13),
      categoryId: category._id,
      brandId: brand._id,
      costPrice: p.cost,
      sellingPrice: p.price,
      stock: p.stock,
      lowStockThreshold: 5,
      taxRate: 10,
      branchId: branch._id,
      isActive: true,
    });
  }

  await Customer.create([
    { name: "Walk-in Customer", phone: "000-000-0000", loyaltyPoints: 0 },
    { name: "Jane Retail", email: "jane@example.com", phone: "+1 555-0201", loyaltyPoints: 120, dueBalance: 0 },
    { name: "Bob Wholesale", email: "bob@corp.com", phone: "+1 555-0202", loyaltyPoints: 450, dueBalance: 150.5 },
  ]);

  await Supplier.create([
    { name: "Tech Distributors Inc", company: "TechDist", email: "orders@techdist.com", phone: "+1 555-1001" },
    { name: "Global Supplies Co", company: "GlobalSup", email: "sales@globalsup.com", phone: "+1 555-1002" },
  ]);

  console.log("\n✅ Seed complete!");
  console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
  console.log("   Cashier: cashier@pos.local / Cashier@123");
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
