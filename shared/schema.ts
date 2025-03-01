import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(), // Plain text content
  createdBy: text("created_by").notNull(), // Wallet address
  shareableLink: text("shareable_link").notNull().unique(),
  status: text("status").notNull().default('pending'), // pending, signed
});

export const signatures = pgTable("signatures", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull(),
  signerAddress: text("signer_address").notNull(),
  signature: text("signature").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  shareableLink: true,
  status: true,
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({
  id: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;