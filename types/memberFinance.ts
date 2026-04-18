export type ContributionType = 'Tithe' | 'Offering' | 'Project' | 'Donation';

export interface MemberTransaction {
  id: string;
  type: ContributionType;
  date: string;
  receiptNumber: string;
  amount: number;
}

export interface MemberContribution {
  id: string;
  name: string;
  memberId: string;
  phone: string;
  avatarUrl?: string;
  totalYTD: number;
  status: 'Active' | 'Inactive';
  memberSince: string;
  titheYTD: number;
  offeringsYTD: number;
  projectsYTD: number;
  transactions: MemberTransaction[];
}
