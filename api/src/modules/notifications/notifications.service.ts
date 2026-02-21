import sgMail from "@sendgrid/mail";

import { logger } from "../../common/logger.js";
import { env } from "../../config/env.js";
import { query } from "../../db/pool.js";
import {
  ApiKeyExpiryAlertPayload,
  ContractCreatedNotificationPayload,
  ContractFullyAllocatedNotificationPayload,
  ContractRiskAlertPayload,
  DocumentsReadyNotificationPayload,
  NotificationEmailMessage,
  NotificationRecipientRoles,
  ShipmentCreatedNotificationPayload,
  ShipmentStatus,
  ShipmentStatusNotificationPayload,
  StockAdjustedNotificationPayload,
} from "./notifications.types.js";
import { apiKeyExpiringTemplate } from "./templates/api-key-expiring.js";
import { contractCreatedTemplate } from "./templates/contract-created.js";
import { contractFullyAllocatedTemplate } from "./templates/contract-fully-allocated.js";
import { contractRiskTemplate } from "./templates/contract-risk-alert.js";
import { documentsReadyTemplate } from "./templates/documents-ready.js";
import { shipmentCreatedTemplate } from "./templates/shipment-created.js";
import { shipmentStatusTemplate } from "./templates/shipment-status.js";
import { stockAdjustedTemplate } from "./templates/stock-adjusted.js";

const statusRecipients: Partial<Record<ShipmentStatus, NotificationRecipientRoles>> = {
  stuffed: ["admin", "warehouse"],
  cleared: ["admin", "finance", "compliance"],
  on_vessel: ["admin", "trader"],
  completed: ["admin", "finance"],
};

export class NotificationService {
  private readonly adminEmails: string[];

  constructor() {
    this.adminEmails = env.notificationAdminEmails;

    if (env.sendgridApiKey) {
      sgMail.setApiKey(env.sendgridApiKey);
    }

    if (!this.isEmailConfigured()) {
      logger.warn("Notification email is disabled due to missing configuration", {
        has_sendgrid_key: Boolean(env.sendgridApiKey),
        has_from_email: Boolean(env.notificationFromEmail),
        admin_email_count: this.adminEmails.length,
      });
    }
  }

  private isEmailConfigured(): boolean {
    return Boolean(env.sendgridApiKey && env.notificationFromEmail);
  }

  private async findUsersByRoles(roles: NotificationRecipientRoles): Promise<string[]> {
    if (roles.length === 0) {
      return [];
    }

    const result = await query<{ email: string }>(
      `
      SELECT email
      FROM users
      WHERE is_active = TRUE
        AND role::text = ANY($1::text[])
      `,
      [roles],
    );

    return result.rows
      .map((row) => row.email.trim().toLowerCase())
      .filter((email) => email.length > 0);
  }

  private uniqueRecipients(...groups: Array<string[] | undefined>): string[] {
    const deduped = new Set<string>();

    for (const group of groups) {
      if (!group) {
        continue;
      }

      for (const email of group) {
        const normalized = email.trim().toLowerCase();
        if (normalized.length > 0) {
          deduped.add(normalized);
        }
      }
    }

    return Array.from(deduped);
  }

  private async sendEmail(message: NotificationEmailMessage): Promise<void> {
    if (!this.isEmailConfigured()) {
      return;
    }

    if (message.to.length === 0) {
      return;
    }

    try {
      await sgMail.sendMultiple({
        to: message.to,
        from: env.notificationFromEmail as string,
        subject: message.subject,
        html: message.html,
      });
    } catch (error) {
      logger.error("Notification email dispatch failed", {
        subject: message.subject,
        recipients: message.to,
        error,
      });
    }
  }

  private async notifyByRoles(params: {
    roles: NotificationRecipientRoles;
    subject: string;
    html: string;
    extraRecipients?: string[];
  }): Promise<void> {
    try {
      const roleRecipients = await this.findUsersByRoles(params.roles);
      const recipients = this.uniqueRecipients(this.adminEmails, roleRecipients, params.extraRecipients);
      await this.sendEmail({
        to: recipients,
        subject: params.subject,
        html: params.html,
      });
    } catch (error) {
      logger.error("Notification recipient resolution failed", {
        subject: params.subject,
        roles: params.roles,
        error,
      });
    }
  }

  async notifyShipmentCreated(payload: ShipmentCreatedNotificationPayload): Promise<void> {
    await this.notifyByRoles({
      roles: ["admin", "trader"],
      subject: `Shipment ${payload.shipmentNumber} planned`,
      html: shipmentCreatedTemplate(payload),
    });
  }

  async notifyShipmentStatusChanged(payload: ShipmentStatusNotificationPayload): Promise<void> {
    const roles = statusRecipients[payload.newStatus];
    if (!roles) {
      return;
    }

    await this.notifyByRoles({
      roles,
      subject: `Shipment ${payload.shipmentNumber} is now ${payload.newStatus}`,
      html: shipmentStatusTemplate(payload),
    });
  }

  async notifyDocumentsReady(payload: DocumentsReadyNotificationPayload): Promise<void> {
    await this.notifyByRoles({
      roles: ["admin", "compliance"],
      subject: `Documents ready for shipment ${payload.shipmentNumber}`,
      html: documentsReadyTemplate(payload),
    });
  }

  async notifyContractCreated(payload: ContractCreatedNotificationPayload): Promise<void> {
    await this.notifyByRoles({
      roles: ["admin", "trader"],
      subject: `New contract ${payload.contractNumber} created`,
      html: contractCreatedTemplate(payload),
    });
  }

  async notifyContractFullyAllocated(payload: ContractFullyAllocatedNotificationPayload): Promise<void> {
    await this.notifyByRoles({
      roles: ["admin", "trader"],
      subject: `Contract ${payload.contractNumber} fully allocated`,
      html: contractFullyAllocatedTemplate(payload),
    });
  }

  async notifyStockAdjusted(payload: StockAdjustedNotificationPayload): Promise<void> {
    await this.notifyByRoles({
      roles: ["admin", "warehouse"],
      subject: `Stock adjustment on lot ${payload.lotCode}`,
      html: stockAdjustedTemplate(payload),
    });
  }

  async notifyContractRiskAlert(payload: ContractRiskAlertPayload): Promise<void> {
    await this.notifyByRoles({
      roles: ["admin", "trader"],
      subject: `Risk alert: contract ${payload.contractNumber} has ${Math.round(payload.unallocatedKg)} kg unallocated`,
      html: contractRiskTemplate(payload),
    });
  }

  async notifyApiKeyExpiring(payload: ApiKeyExpiryAlertPayload): Promise<void> {
    await this.notifyByRoles({
      roles: ["admin"],
      extraRecipients: [payload.ownerEmail],
      subject: `API key ${payload.keyName} expires in ${payload.daysToExpiry} day(s)`,
      html: apiKeyExpiringTemplate(payload),
    });
  }
}

export const notificationsService = new NotificationService();
