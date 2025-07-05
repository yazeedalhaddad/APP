import {
  getDrafts as dbGetDrafts,
  getDraftById as dbGetDraftById,
  createDraft as dbCreateDraft,
  updateDraft as dbUpdateDraft,
  deleteDraft as dbDeleteDraft,
  createAuditLog,
} from "@/lib/database"
import { NotFoundError, AuthorizationError } from "@/lib/utils/errors"
import type { Draft } from "@/types/database"

export interface CreateDraftData {
  document_id: string
  name: string
  description?: string
  base_version_id: string
  file_path?: string
}

export interface UpdateDraftData {
  name?: string
  description?: string
  status?: string
  file_path?: string
}

export interface DraftFilters {
  limit?: number
  offset?: number
  document_id?: string
  creator_id?: string
  status?: string
}

export class DraftService {
  async getDrafts(filters: DraftFilters = {}): Promise<Draft[]> {
    return await dbGetDrafts(filters)
  }

  async getDraftById(id: string): Promise<Draft> {
    const draft = await dbGetDraftById(id)
    if (!draft) {
      throw new NotFoundError("Draft not found")
    }
    return draft
  }

  async createDraft(
    draftData: CreateDraftData,
    creatorId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Draft> {
    const draft = await dbCreateDraft({
      ...draftData,
      creator_id: creatorId,
    })

    // Create audit log
    await createAuditLog({
      user_id: creatorId,
      action: "DRAFT_CREATED",
      document_id: draftData.document_id,
      draft_id: draft.id,
      details: { name: draftData.name, base_version_id: draftData.base_version_id },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return draft
  }

  async updateDraft(
    id: string,
    updates: UpdateDraftData,
    userId: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Draft> {
    const existingDraft = await dbGetDraftById(id)
    if (!existingDraft) {
      throw new NotFoundError("Draft not found")
    }

    // Check permissions - only creator or admin can update
    if (existingDraft.creator_id !== userId && userRole !== "admin") {
      throw new AuthorizationError("Only the draft creator or admin can update this draft")
    }

    const updatedDraft = await dbUpdateDraft(id, updates)
    if (!updatedDraft) {
      throw new NotFoundError("Draft not found")
    }

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "DRAFT_UPDATED",
      draft_id: id,
      details: { updates },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return updatedDraft
  }

  async deleteDraft(
    id: string,
    userId: string,
    userRole: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const existingDraft = await dbGetDraftById(id)
    if (!existingDraft) {
      throw new NotFoundError("Draft not found")
    }

    // Check permissions - only creator or admin can delete
    if (existingDraft.creator_id !== userId && userRole !== "admin") {
      throw new AuthorizationError("Only the draft creator or admin can delete this draft")
    }

    await dbDeleteDraft(id)

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "DRAFT_DELETED",
      draft_id: id,
      details: { name: existingDraft.name },
      ip_address: ipAddress,
      user_agent: userAgent,
    })
  }
}

export const draftService = new DraftService()
