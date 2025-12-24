import { prisma } from "./prisma"

interface CreateNotificationData {
  userId: string
  type: string
  title: string
  message: string
  link?: string | null
}

// Create a notification for a user
export async function createNotification(data: CreateNotificationData) {
  try {
    await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link || null,
      },
    })
  } catch (error) {
    // Don't fail the main operation if notification creation fails
    console.error("Failed to create notification:", error)
  }
}

// Create notification when review is approved
export async function notifyReviewApproved(reviewId: string, userId: string) {
  await createNotification({
    userId,
    type: "REVIEW_APPROVED",
    title: "Review Approved",
    message: "Your review has been approved and is now visible to other users.",
    link: `/reviews/${reviewId}`,
  })
}

// Create notification when review is rejected
export async function notifyReviewRejected(
  reviewId: string,
  userId: string,
  reason?: string
) {
  await createNotification({
    userId,
    type: "REVIEW_REJECTED",
    title: "Review Rejected",
    message: reason
      ? `Your review has been rejected. Reason: ${reason}`
      : "Your review has been rejected. Please check the rejection reason.",
    link: `/me/reviews`,
  })
}

// Create notification when review needs edit
export async function notifyReviewNeedsEdit(reviewId: string, userId: string) {
  await createNotification({
    userId,
    type: "REVIEW_NEEDS_EDIT",
    title: "Review Needs Edit",
    message: "Your review has been flagged for editing. Please update it based on admin feedback.",
    link: `/reviews/${reviewId}/edit`,
  })
}

// Create notification when report is actioned
export async function notifyReportActioned(
  reviewId: string,
  userId: string,
  actionType: string
) {
  await createNotification({
    userId,
    type: "REPORT_ACTIONED",
    title: "Report Actioned",
    message: `A report on your review has been processed. Action taken: ${actionType}`,
    link: `/reviews/${reviewId}`,
  })
}

// Create notification when company request is approved
export async function notifyCompanyRequestApproved(
  companyId: string,
  userId: string,
  companyName: string
) {
  await createNotification({
    userId,
    type: "COMPANY_REQUEST_APPROVED",
    title: "Company Request Approved",
    message: `Your request to add "${companyName}" has been approved. The company is now available on the platform.`,
    link: `/companies/${companyId}`,
  })
}

// Create notification when company request is rejected
export async function notifyCompanyRequestRejected(
  userId: string,
  companyName: string,
  reason?: string
) {
  await createNotification({
    userId,
    type: "COMPANY_REQUEST_REJECTED",
    title: "Company Request Rejected",
    message: reason
      ? `Your request to add "${companyName}" has been rejected. Reason: ${reason}`
      : `Your request to add "${companyName}" has been rejected.`,
    link: `/request-company`,
  })
}

