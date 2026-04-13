import {
  fetchDepartmentMembers,
  fetchDepartmentMemberMessages,
  sendDepartmentMemberMessage,
  type DepartmentMemberApiRow,
  type DepartmentMemberMessageHistoryItem,
} from '@/lib/departmentsApi';
import type { Member, Message, SendMessagePayload } from '../types/message';

function mapRowsToMembers(rows: DepartmentMemberApiRow[], departmentName: string): Member[] {
  return rows.map((row) => {
    const parts = [row.first_name, row.middle_name, row.last_name].filter(Boolean) as string[];
    const name = parts.join(' ').trim() || 'Member';
    const loc = row.location;
    return {
      id: String(row.id),
      name,
      email: (loc?.email ?? '').trim(),
      phone: (loc?.phone_primary ?? '').trim(),
      department: departmentName,
    };
  });
}

function mapHistoryToMessages(rows: DepartmentMemberMessageHistoryItem[]): Message[] {
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    content: r.content,
    type: 'in_app' as const,
    recipientCount: r.recipientCount,
    recipientIds: r.recipientIds,
    status: r.status === 'delivered' ? ('delivered' as const) : ('pending' as const),
    sentAt: r.sentAt ? new Date(r.sentAt) : new Date(),
  }));
}

export function createDepartmentMessagingApi(departmentId: string, departmentName: string) {
  return {
    async getMembers(): Promise<Member[]> {
      if (!departmentId) {
        return [];
      }
      const rows = await fetchDepartmentMembers(departmentId);
      return mapRowsToMembers(rows, departmentName);
    },

    async getRecentMessages(): Promise<Message[]> {
      if (!departmentId) {
        return [];
      }
      const rows = await fetchDepartmentMemberMessages(departmentId);
      return mapHistoryToMessages(rows);
    },

    async sendBulkEmail(
      payload: SendMessagePayload
    ): Promise<{ success: boolean; messageId: string }> {
      const res = await sendDepartmentMemberMessage(departmentId, {
        channel: 'email',
        subject: payload.title,
        body: payload.content,
        member_ids: payload.recipientIds,
      });
      if (!res.success) {
        throw new Error(res.detail || 'Email could not be sent.');
      }
      return { success: true, messageId: res.message_id };
    },

    async sendBulkInApp(
      payload: SendMessagePayload
    ): Promise<{ success: boolean; messageId: string }> {
      const res = await sendDepartmentMemberMessage(departmentId, {
        channel: 'in_app',
        subject: payload.title,
        body: payload.content,
        member_ids: payload.recipientIds,
      });
      if (!res.success) {
        throw new Error(res.detail || 'Message could not be sent.');
      }
      return { success: true, messageId: res.message_id };
    },

    async sendBulkSms(
      payload: SendMessagePayload
    ): Promise<{ success: boolean; messageId: string }> {
      const res = await sendDepartmentMemberMessage(departmentId, {
        channel: 'sms',
        subject: payload.title,
        body: payload.content,
        member_ids: payload.recipientIds,
      });
      if (!res.success) {
        throw new Error(res.detail || 'SMS could not be sent.');
      }
      return { success: true, messageId: res.message_id };
    },
  };
}

export type DepartmentMessagingApi = ReturnType<typeof createDepartmentMessagingApi>;
