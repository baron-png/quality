// services/NotificationDispatcher.ts

import { EmailNotificationService } from "./EmailNotificationService";


type NotificationChannel = "IN_APP" | "EMAIL" | "PUSH";

interface NotificationPayload {
  title: string;
  message: string;
  userId?: string; // null = system-wide
  tenantId: string;
  documentId?: string;
  changeRequestId?: string;
  link?: string;
  priority?: "High" | "Medium" | "Low";
  channels: NotificationChannel[];
}

export class NotificationDispatcher {
  private emailService: EmailNotificationService;

  constructor() {
    this.emailService = new EmailNotificationService();
  }

  async dispatch(payload: NotificationPayload) {
    const { channels } = payload;

    if (channels.includes("EMAIL")) {
      await this.emailService.send(payload);
    }

    // Push and in-app can be handled similarly later
  }
}
