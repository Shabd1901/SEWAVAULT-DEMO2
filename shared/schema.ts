import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tokens = pgTable("tokens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenNumber: integer("token_number").notNull().unique(),
  secret: text("secret").notNull(),
  barcodeData: text("barcode_data").notNull(),
  isInUse: boolean("is_in_use").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tokenNumber: integer("token_number").notNull(),
  sangatPhoto: text("sangat_photo").notNull(), // base64 image
  items: jsonb("items").notNull(), // array of {name: string, quantity: number}
  others: text("others"), // optional other items
  depositTimestamp: timestamp("deposit_timestamp").default(sql`now()`),
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  depositTimestamp: true,
});

export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof deposits.$inferSelect;

// Frontend types
export interface TokenRecord {
  tokenNumber: number;
  secret: string;
  barcodeData: string;
  isInUse: boolean;
  deposit?: DepositRecord;
}

export interface DepositRecord {
  sangatPhoto: string;
  items: ItemQuantity[];
  others?: string;
  timestamp: number;
}

export interface ItemQuantity {
  name: string;
  quantity: number;
}

export const ITEM_TYPES = [
  { id: 'mobile', name: 'Mobile', icon: 'smartphone' },
  { id: 'earphones', name: 'Earphones', icon: 'headphones' },
  { id: 'headset', name: 'Headset', icon: 'headphones' },
  { id: 'watch', name: 'Watch', icon: 'watch' },
  { id: 'charger', name: 'Charger', icon: 'plug' },
  { id: 'powerbank', name: 'Powerbank', icon: 'battery' },
] as const;
