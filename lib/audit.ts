import { prisma } from "./prisma"

interface AuditLogData {
  userId: string
  action: string
  entityType: string
  entityId: string
  details?: string | null
}

// Create audit log entry for admin actions
export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        details: data.details || null,
      },
    })
  } catch (error) {
    // Don't fail the main operation if audit logging fails
    console.error("Failed to create audit log:", error)
  }
}

