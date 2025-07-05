"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { createUser, createDocument, createDraft, createMergeRequest, createAuditLog } from "./database"

export async function createUserAction(formData: FormData) {
  try {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const department = formData.get("department") as string

    if (!name || !email || !password || !role) {
      return { success: false, message: "All fields are required" }
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await createUser({
      name,
      email,
      password: hashedPassword,
      role,
      department: department || "",
    })

    revalidatePath("/admin/users")
    return { success: true, message: "User created successfully", data: user }
  } catch (error) {
    console.error("Create user action error:", error)
    return { success: false, message: "Failed to create user" }
  }
}

export async function createDocumentAction(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const file_type = formData.get("file_type") as string
    const classification = formData.get("classification") as string
    const owner_id = formData.get("owner_id") as string
    const file_path = formData.get("file_path") as string
    const file_size = Number.parseInt((formData.get("file_size") as string) || "0")

    if (!title || !file_type || !classification || !owner_id || !file_path) {
      return { success: false, message: "Required fields are missing" }
    }

    const document = await createDocument({
      title,
      description,
      file_type,
      classification,
      owner_id,
      file_path,
      file_size,
    })

    // Create audit log
    await createAuditLog({
      user_id: owner_id,
      action: "DOCUMENT_CREATED",
      document_id: document.id,
      details: { title, classification, file_type },
    })

    revalidatePath("/documents")
    return { success: true, message: "Document created successfully", data: document }
  } catch (error) {
    console.error("Create document action error:", error)
    return { success: false, message: "Failed to create document" }
  }
}

export async function createDraftAction(formData: FormData) {
  try {
    const document_id = formData.get("document_id") as string
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const creator_id = formData.get("creator_id") as string
    const base_version_id = formData.get("base_version_id") as string

    if (!document_id || !name || !creator_id || !base_version_id) {
      return { success: false, message: "Required fields are missing" }
    }

    const draft = await createDraft({
      document_id,
      name,
      description,
      creator_id,
      base_version_id,
    })

    // Create audit log
    await createAuditLog({
      user_id: creator_id,
      action: "DRAFT_CREATED",
      document_id,
      draft_id: draft.id,
      details: { name, base_version_id },
    })

    revalidatePath("/drafts")
    return { success: true, message: "Draft created successfully", data: draft }
  } catch (error) {
    console.error("Create draft action error:", error)
    return { success: false, message: "Failed to create draft" }
  }
}

export async function createMergeRequestAction(formData: FormData) {
  try {
    const draft_id = formData.get("draft_id") as string
    const approver_id = formData.get("approver_id") as string
    const summary = formData.get("summary") as string
    const creator_id = formData.get("creator_id") as string

    if (!draft_id || !approver_id || !summary || !creator_id) {
      return { success: false, message: "Required fields are missing" }
    }

    const mergeRequest = await createMergeRequest({
      draft_id,
      approver_id,
      summary,
    })

    // Create audit log
    await createAuditLog({
      user_id: creator_id,
      action: "MERGE_REQUEST_CREATED",
      merge_request_id: mergeRequest.id,
      draft_id,
      details: { approver_id, summary },
    })

    revalidatePath("/merge-requests")
    return { success: true, message: "Merge request created successfully", data: mergeRequest }
  } catch (error) {
    console.error("Create merge request action error:", error)
    return { success: false, message: "Failed to create merge request" }
  }
}
