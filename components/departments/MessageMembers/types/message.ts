export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  avatar?: string;
}

export interface Message {
  id: string;
  title: string;
  content: string;
  type: 'email' | 'sms';
  recipientCount: number;
  recipientIds: string[];
  status: 'delivered' | 'pending' | 'failed';
  sentAt: Date;
}

export interface SendMessagePayload {
  title: string;
  content: string;
  type: 'email' | 'sms';
  recipientIds: string[];
}
