import { ThemeColor } from '@/constants/departments';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  members: number;
  activities: number;
  budgetUsed: number;
  status: 'active' | 'inactive';
  themeColor: ThemeColor;
  icon: string;
  dateEstablished: string;
}
