import { Member, Message, SendMessagePayload } from '../types/message';
import { mockMembers, mockRecentMessages } from './MockData';   

// Simulated delay for API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
  sendBulkEmail: async (payload: SendMessagePayload): Promise<{ success: boolean; messageId: string }> => {
    await delay(1500);
    
    console.log('📧 Sending bulk email:', {
      title: payload.title,
      content: payload.content,
      recipients: payload.recipientIds.length,
      recipientEmails: mockMembers
        .filter(m => payload.recipientIds.includes(m.id))
        .map(m => m.email)
    });

    // Simulate successful send
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  },

  // Send bulk SMS
  sendBulkSMS: async (payload: SendMessagePayload): Promise<{ success: boolean; messageId: string }> => {
    await delay(1500);
    
    console.log('📱 Sending bulk SMS:', {
      title: payload.title,
      content: payload.content,
      recipients: payload.recipientIds.length,
      recipientPhones: mockMembers
        .filter(m => payload.recipientIds.includes(m.id))
        .map(m => m.phone)
    });

    // Simulate successful send
    return {
      success: true,
      messageId: `msg_${Date.now()}`,
    };
  },
};

