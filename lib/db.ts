/**
 * Database client re-export
 * Some legacy code imports `sql` from "lib/db" instead of "lib/database"
 * This file provides compatibility by re-exporting the database client
 */
export { sql, checkDatabaseHealth } from "./database"

// Re-export all database functions for compatibility
export {
  // User functions
  getUserById,
  getUserByEmail,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  // Document functions
  getDocuments,
  getDocumentById,
  getDocumentVersions,
  getDocumentVersion,
  createDocument,
  updateDocument,
  deleteDocument,
  searchDocuments,
  // Draft functions
  getDrafts,
  getDraftById,
  createDraft,
  updateDraft,
  deleteDraft,
  // Merge request functions
  getMergeRequests,
  getMergeRequestById,
  createMergeRequest,
  updateMergeRequestStatus,
  // Audit log functions
  createAuditLog,
  getAuditLogs,
  // Report functions
  createReport,
  getReportByTaskId,
  updateReportStatus,
  // Dashboard functions
  getDashboardMetrics,
  // Permission functions
  checkDocumentPermission,
  getUserRole,
} from "./database"
