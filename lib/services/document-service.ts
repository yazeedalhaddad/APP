import {
  getDocuments as dbGetDocuments,
  getDocumentById as dbGetDocumentById,
  getDocumentVersions as dbGetDocumentVersions,
  getDocumentVersion as dbGetDocumentVersion,
  createDocument as dbCreateDocument,
  updateDocument as dbUpdateDocument,
  deleteDocument as dbDeleteDocument,
  searchDocuments as dbSearchDocuments,
  createAuditLog,
} from "@/lib/database"
import { NotFoundError } from "@/lib/utils/errors"
import type { Document, DocumentVersion } from "@/types/database"

export interface CreateDocumentData {
  title: string
  description?: string
  file_type: string
  classification: string
  file_path: string
  file_size: number
}

export interface UpdateDocumentData {
  title?: string
  description?: string
  classification?: string
}

export interface DocumentFilters {
  limit?: number
  offset?: number
  classification?: string
  owner_id?: string
  search?: string
}

export class DocumentService {
  async getDocuments(filters: DocumentFilters = {}): Promise<Document[]> {
    return await dbGetDocuments(filters)
  }

  async getDocumentById(id: string, userId: string, ipAddress?: string, userAgent?: string): Promise<Document> {
    const document = await dbGetDocumentById(id)
    if (!document) {
      throw new NotFoundError("Document not found")
    }

    // Create audit log for document view
    await createAuditLog({
      user_id: userId,
      action: "DOCUMENT_VIEWED",
      document_id: id,
      details: { title: document.title },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return document
  }

  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    const document = await dbGetDocumentById(documentId)
    if (!document) {
      throw new NotFoundError("Document not found")
    }

    return await dbGetDocumentVersions(documentId)
  }

  async getDocumentVersion(
    documentId: string,
    versionNumber: number,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<DocumentVersion> {
    const version = await dbGetDocumentVersion(documentId, versionNumber)
    if (!version) {
      throw new NotFoundError("Document version not found")
    }

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "DOCUMENT_VERSION_VIEWED",
      document_id: documentId,
      details: { version_number: versionNumber },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return version
  }

  async createDocument(
    documentData: CreateDocumentData,
    ownerId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Document> {
    const document = await dbCreateDocument({
      ...documentData,
      owner_id: ownerId,
    })

    // Create audit log
    await createAuditLog({
      user_id: ownerId,
      action: "DOCUMENT_CREATED",
      document_id: document.id,
      details: {
        title: documentData.title,
        classification: documentData.classification,
        file_type: documentData.file_type,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return document
  }

  async updateDocument(
    id: string,
    updates: UpdateDocumentData,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Document> {
    const existingDocument = await dbGetDocumentById(id)
    if (!existingDocument) {
      throw new NotFoundError("Document not found")
    }

    const updatedDocument = await dbUpdateDocument(id, updates)
    if (!updatedDocument) {
      throw new NotFoundError("Document not found")
    }

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "DOCUMENT_UPDATED",
      document_id: id,
      details: { updates },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return updatedDocument
  }

  async deleteDocument(id: string, userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    const existingDocument = await dbGetDocumentById(id)
    if (!existingDocument) {
      throw new NotFoundError("Document not found")
    }

    await dbDeleteDocument(id)

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "DOCUMENT_DELETED",
      document_id: id,
      details: { title: existingDocument.title },
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }

  async searchDocuments(query: string, userId: string, ipAddress?: string, userAgent?: string): Promise<Document[]> {
    const documents = await dbSearchDocuments(query)

    // Create audit log for search
    await createAuditLog({
      user_id: userId,
      action: "DOCUMENTS_SEARCHED",
      details: { query, results_count: documents.length },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return documents
  }
}

export const documentService = new DocumentService()
