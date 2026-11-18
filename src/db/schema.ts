import { pgTable, text, serial, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  parentId: integer("parent_id"), // Pro zanoření kategorií
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  xmlId: text("xml_id").unique(), // ID produktu z Hejduk XML
  itemGroupId: text("itemgroup_id"), // Pro seskupení variant (např. velikostí) do jednoho produktu
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  stock: integer("stock").default(0).notNull(),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").references(() => categories.id),
  attributes: jsonb("attributes"), // Dynamické parametry jako Velikost, Barva
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role").default("customer").notNull(), // customer, admin
  createdAt: timestamp("created_at").defaultNow(),
});

export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  zip: text("zip").notNull(),
  country: text("country").default("CZ").notNull(),
  isDefaultShipping: boolean("is_default_shipping").default(false).notNull(),
  isDefaultBilling: boolean("is_default_billing").default(false).notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").references(() => users.id), // Volitelné pro nákup jako host
  customerEmail: text("customer_email").notNull(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("pending").notNull(), // pending, paid, shipped, cancelled
  gopayId: text("gopay_id"), // ID platby z GoPay
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

// Relace (pro snadnější tahání dat s Drizzle)
export const productsRelations = relations(products, ({ one }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
