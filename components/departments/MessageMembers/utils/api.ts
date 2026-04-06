import { Member, Message, SendMessagePayload } from '../types/message';
import { mockMembers, mockRecentMessages } from './MockData';

// Simulated delay for API calls
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock API endpoints
export const api = {
  // Get all members
  getMembers: async (): Promise<Member[]> => {
    await delay(500);
    return mockMembers;
  },

  // Get recent messages
  getRecentMessages: async (): Promise<Message[]> => {
    await delay(500);
    return mockRecentMessages;
  },

  // Send bulk email
  sendBulkEmail: async (
    payload: SendMessagePayload
  ): Promise<{ success: boolean; messageId: string }> => {
    await delay(1500);

    // Simulate successful send
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  },

  // Send bulk SMS
  sendBulkSMS: async (
    payload: SendMessagePayload
  ): Promise<{ success: boolean; messageId: string }> => {
    await delay(1500);

    // Simulate successful send
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  },
};
