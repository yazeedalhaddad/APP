import {
  getMergeRequests as dbGetMergeRequests,
  getMergeRequestById as dbGetMergeRequestById,
  createMergeRequest as dbCreateMergeRequest,
  updateMergeRequestStatus as dbUpdateMergeRequestStatus,
  createAuditLog,
} from "@/lib/database"
import { NotFoundError, AuthorizationError } from "@/lib/utils/errors"
import type { MergeRequest } from "@/types/database"

export interface CreateMergeRequestData {
  draft_id: string
  approver_id: string
  summary: string
}

export interface MergeRequestFilters {
  limit?: number
  offset?: number
  status?: string
  approver_id?: string
}

export class MergeRequestService {
  async getMergeRequests(filters: MergeRequestFilters = {}): Promise<MergeRequest[]> {
    return await dbGetMergeRequests(filters)
  }

  async getMergeRequestById(id: string): Promise<MergeRequest> {
    const mergeRequest = await dbGetMergeRequestById(id)
    if (!mergeRequest) {
      throw new NotFoundError("Merge request not found")
    }
    return mergeRequest
  }

  async createMergeRequest(
    mergeRequestData: CreateMergeRequestData,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MergeRequest> {
    const mergeRequest = await dbCreateMergeRequest(mergeRequestData)

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "MERGE_REQUEST_CREATED",
      merge_request_id: mergeRequest.id,
      draft_id: mergeRequestData.draft_id,
      details: {
        approver_id: mergeRequestData.approver_id,
        summary: mergeRequestData.summary,
      },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return mergeRequest
  }

  async approveMergeRequest(
    id: string,
    userId: string,
    userName: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MergeRequest> {
    const existingMergeRequest = await dbGetMergeRequestById(id)
    if (!existingMergeRequest) {
      throw new NotFoundError("Merge request not found")
    }

    if (existingMergeRequest.status !== "pending") {
      throw new AuthorizationError("Merge request is not in pending status")
    }

    const updatedMergeRequest = await dbUpdateMergeRequestStatus(id, "approved", userId)
    if (!updatedMergeRequest) {
      throw new NotFoundError("Merge request not found")
    }

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "MERGE_REQUEST_APPROVED",
      merge_request_id: id,
      details: { approver: userName },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return updatedMergeRequest
  }

  async rejectMergeRequest(
    id: string,
    reason: string | undefined,
    userId: string,
    userName: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<MergeRequest> {
    const existingMergeRequest = await dbGetMergeRequestById(id)
    if (!existingMergeRequest) {
      throw new NotFoundError("Merge request not found")
    }

    if (existingMergeRequest.status !== "pending") {
      throw new AuthorizationError("Merge request is not in pending status")
    }

    const updatedMergeRequest = await dbUpdateMergeRequestStatus(id, "rejected", userId, reason)
    if (!updatedMergeRequest) {
      throw new NotFoundError("Merge request not found")
    }

    // Create audit log
    await createAuditLog({
      user_id: userId,
      action: "MERGE_REQUEST_REJECTED",
      merge_request_id: id,
      details: { approver: userName, reason },
      ip_address: ipAddress,
      user_agent: userAgent,
    })

    return updatedMergeRequest
  }
}

export const mergeRequestService = new MergeRequestService()
