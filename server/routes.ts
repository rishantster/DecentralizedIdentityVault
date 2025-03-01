import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertDocumentSchema, insertSignatureSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/documents", async (req, res) => {
    const result = insertDocumentSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid document data" });
    }

    const document = await storage.createDocument(result.data);
    res.json(document);
  });

  app.get("/api/documents/:id", async (req, res) => {
    const document = await storage.getDocument(Number(req.params.id));
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  });

  app.get("/api/documents/creator/:address", async (req, res) => {
    const documents = await storage.getDocumentsByCreator(req.params.address);
    res.json(documents);
  });

  app.get("/api/documents/share/:link", async (req, res) => {
    const document = await storage.getDocumentByShareableLink(req.params.link);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }
    res.json(document);
  });

  app.get("/api/documents/:id/signatures", async (req, res) => {
    const signatures = await storage.getSignatures(Number(req.params.id));
    res.json(signatures);
  });

  app.post("/api/documents/:id/signatures", async (req, res) => {
    const result = insertSignatureSchema.safeParse({
      ...req.body,
      documentId: Number(req.params.id)
    });

    if (!result.success) {
      return res.status(400).json({ message: "Invalid signature data" });
    }

    const signature = await storage.addSignature(result.data);
    res.json(signature);
  });

  // Update document content
  app.patch("/api/documents/:id", async (req, res) => {
    const document = await storage.getDocument(Number(req.params.id));
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    const updatedDocument = await storage.updateDocument(Number(req.params.id), {
      content: req.body.content
    });

    res.json(updatedDocument);
  });

  const httpServer = createServer(app);
  return httpServer;
}