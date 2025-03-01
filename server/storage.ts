import { nanoid } from "nanoid";
import { documents, signatures, type Document, type Signature, type InsertDocument, type InsertSignature } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByShareableLink(link: string): Promise<Document | undefined>;
  getDocumentsByCreator(address: string): Promise<Document[]>;
  getSignatures(documentId: number): Promise<Signature[]>;
  addSignature(signature: InsertSignature): Promise<Signature>;
  updateDocument(id: number, updates: Partial<Document>): Promise<Document>;
}

export class DatabaseStorage implements IStorage {
  async createDocument(doc: InsertDocument): Promise<Document> {
    const [document] = await db
      .insert(documents)
      .values(doc)
      .returning();
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id));
    return document;
  }

  async getDocumentByShareableLink(link: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.shareableLink, link));
    return document;
  }

  async getDocumentsByCreator(address: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.createdBy, address))
      .orderBy(documents.id);
  }

  async getSignatures(documentId: number): Promise<Signature[]> {
    return await db
      .select()
      .from(signatures)
      .where(eq(signatures.documentId, documentId));
  }

  async addSignature(signature: InsertSignature): Promise<Signature> {
    const [newSignature] = await db
      .insert(signatures)
      .values(signature)
      .returning();

    // Update document status
    await db
      .update(documents)
      .set({ status: 'signed' })
      .where(eq(documents.id, signature.documentId));

    return newSignature;
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    const [document] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();

    if (!document) {
      throw new Error('Document not found');
    }

    return document;
  }
}

export const storage = new DatabaseStorage();