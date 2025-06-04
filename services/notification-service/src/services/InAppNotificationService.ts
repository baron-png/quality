import { prisma } from "../../prismaClient";

interface InAppNotificationInput {
  title: string;
  message: string;
  userId?: string;
  tenantId: string;
  documentId?: string;
  changeRequestId?: string;
  link?: string;
  priority?: "High" | "Medium" | "Low";
  expiresAt?: Date;
}

export class InAppNotificationService {
  static async send(data: InAppNotificationInput) {
    return await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: "System", // You can make this dynamic
        priority: data.priority || "Medium",
        userId: data.userId ?? null,
        tenantId: data.tenantId,
        documentId: data.documentId ?? null,
        changeRequestId: data.changeRequestId ?? null,
        link: data.link ?? null,
        isRead: false,
        expiresAt: data.expiresAt ?? null,
      },
    });
  }
}
