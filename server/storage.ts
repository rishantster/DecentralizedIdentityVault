import { nanoid } from "nanoid";
import { Document, InsertDocument, Signature, InsertSignature } from "@shared/schema";

export interface IStorage {
  createDocument(doc: InsertDocument): Promise<Document>;
  getDocument(id: number): Promise<Document | undefined>;
  getDocumentByShareableLink(link: string): Promise<Document | undefined>;
  getSignatures(documentId: number): Promise<Signature[]>;
  addSignature(signature: InsertSignature): Promise<Signature>;
}

export class MemStorage implements IStorage {
  private documents: Map<number, Document>;
  private signatures: Map<number, Signature>;
  private currentDocId: number;
  private currentSigId: number;

  constructor() {
    this.documents = new Map();
    this.signatures = new Map();
    this.currentDocId = 1;
    this.currentSigId = 1;
  }

  async createDocument(doc: InsertDocument): Promise<Document> {
    const id = this.currentDocId++;
    const shareableLink = nanoid();
    const document: Document = {
      ...doc,
      id,
      shareableLink,
      status: 'pending'
    };
    this.documents.set(id, document);
    return document;
  }

  async getDocument(id: number): Promise<Document | undefined> {
    return this.documents.get(id);
  }

  async getDocumentByShareableLink(link: string): Promise<Document | undefined> {
    return Array.from(this.documents.values()).find(
      (doc) => doc.shareableLink === link
    );
  }

  async getSignatures(documentId: number): Promise<Signature[]> {
    return Array.from(this.signatures.values()).filter(
      (sig) => sig.documentId === documentId
    );
  }

  async addSignature(signature: InsertSignature): Promise<Signature> {
    const id = this.currentSigId++;
    const newSignature: Signature = { ...signature, id };
    this.signatures.set(id, newSignature);
    
    // Update document status
    const document = this.documents.get(signature.documentId);
    if (document) {
      document.status = 'signed';
      this.documents.set(document.id, document);
    }
    
    return newSignature;
  }
}

export const storage = new MemStorage();
