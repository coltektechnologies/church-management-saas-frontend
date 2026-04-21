// /components/treasurydashboard/approvals/approvalsData.ts

export type ExpenseRequest = {
  id: string;
  title: string;
  department: string;
  requestedBy: string;
  date: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  description: string;
  category: string;
  attachments?: string[];
};

export type DepartmentBudget = {
  name: string;
  allocated: number;
  utilized: number;
  currency: string;
};

export type Asset = {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  value: number;
  currency: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  location: string;
  description: string;
};

export const DUMMY_EXPENSE_REQUESTS: ExpenseRequest[] = [
  {
    id: 'TREQ-0001',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Bro. Samuel Wilson',
    date: 'Aug 6, 2024',
    amount: 1200,
    currency: 'GHS',
    status: 'pending',
    category: 'Ministry Supplies',
    description:
      'Purchase of camp supplies, stationery, and educational materials for the upcoming Youth Camp retreat scheduled for August 15-18, 2024.',
    attachments: ['camp_budget.pdf', 'supplier_quote.pdf'],
  },
  {
    id: 'TREQ-0002',
    title: 'Sound System Repair',
    department: 'Music Ministry',
    requestedBy: 'Bro. Daniel Clark',
    date: 'Aug 5, 2024',
    amount: 850,
    currency: 'GHS',
    status: 'pending',
    category: 'Equipment Maintenance',
    description:
      'Repair of main speaker system and replacement of two faulty microphones. The system has been intermittently failing during Sabbath services.',
    attachments: ['technician_quote.pdf'],
  },
  {
    id: 'TREQ-0003',
    title: 'Outreach Materials',
    department: 'Personal Ministry',
    requestedBy: 'Bro. Michael Johnson',
    date: 'Aug 4, 2024',
    amount: 1200,
    currency: 'GHS',
    status: 'pending',
    category: 'Evangelism',
    description:
      'Printing of health magazines, Bible study guides, and flyers for the community outreach campaign planned for the last weekend of August.',
    attachments: ['print_quote.pdf', 'design_files.zip'],
  },
  {
    id: 'TREQ-0004',
    title: 'Quarterly Materials',
    department: 'Sabbath School',
    requestedBy: 'Sis. Sarah Miller',
    date: 'Aug 3, 2024',
    amount: 420,
    currency: 'GHS',
    status: 'pending',
    category: 'Ministry Supplies',
    description:
      'Purchase of Q3 2024 Sabbath School quarterlies for all adult, youth, and children classes. Estimated 85 copies across all age groups.',
    attachments: [],
  },
  {
    id: 'TREQ-0005',
    title: 'Youth Camp Materials',
    department: 'Adventist Youth',
    requestedBy: 'Bro. Samuel Wilson',
    date: 'Aug 6, 2024',
    amount: 1200,
    currency: 'GHS',
    status: 'pending',
    category: 'Ministry Supplies',
    description:
      'Additional transport and accommodation costs for youth camp counselors travelling from the district conference.',
    attachments: ['transport_estimate.pdf'],
  },
  {
    id: 'TREQ-0006',
    title: 'Communion Supplies',
    department: 'Deaconry',
    requestedBy: 'Sis. Grace Asante',
    date: 'Aug 2, 2024',
    amount: 350,
    currency: 'GHS',
    status: 'pending',
    category: 'Worship Supplies',
    description:
      'Restocking of communion bread, grape juice, and serving trays ahead of the quarterly communion service.',
    attachments: [],
  },
];

export const DUMMY_DEPARTMENT_BUDGETS: DepartmentBudget[] = [
  { name: 'Secretariat', allocated: 10000, utilized: 4400, currency: 'GHS' },
  { name: 'Treasury', allocated: 10000, utilized: 4400, currency: 'GHS' },
  { name: 'Deaconry', allocated: 10000, utilized: 4400, currency: 'GHS' },
  { name: 'Personal Ministry', allocated: 10000, utilized: 4400, currency: 'GHS' },
  { name: 'Sabbath School', allocated: 10000, utilized: 4400, currency: 'GHS' },
  { name: 'Adventist Youth', allocated: 10000, utilized: 4400, currency: 'GHS' },
  { name: 'Music Ministry', allocated: 10000, utilized: 5200, currency: 'GHS' },
  { name: 'Health Ministry', allocated: 8000, utilized: 2800, currency: 'GHS' },
];

export const DUMMY_ASSETS: Asset[] = [
  {
    id: 'ASSET-001',
    name: 'Main Sound System',
    category: 'Audio Equipment',
    purchaseDate: 'Jan 15, 2022',
    value: 12000,
    currency: 'GHS',
    condition: 'Good',
    location: 'Main Sanctuary',
    description: 'Pioneer professional speaker set with amplifier and mixing board.',
  },
  {
    id: 'ASSET-002',
    name: 'Church Bus',
    category: 'Vehicles',
    purchaseDate: 'Mar 10, 2020',
    value: 85000,
    currency: 'GHS',
    condition: 'Good',
    location: 'Church Compound',
    description: '32-seater Toyota Coaster bus used for outreach and member transport.',
  },
  {
    id: 'ASSET-003',
    name: 'Projector (Epson)',
    category: 'Audio/Visual',
    purchaseDate: 'Jun 5, 2023',
    value: 4500,
    currency: 'GHS',
    condition: 'Excellent',
    location: 'Main Sanctuary',
    description: 'Epson EB-X49 XGA projector for sermon presentations.',
  },
];

export const TREASURY_SUMMARY = {
  titheYTD: 15420,
  offeringsYTD: 9160,
  projectsYTD: 4280,
  currency: 'GHS',
  churchName: 'Seventh-day Adventist Church',
  adminName: 'Ps Owusu William',
};
