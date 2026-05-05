/**
 * Mappers: Backend API response shapes → Frontend AppDataContext types
 *
 * @module lib/dashboardMappers
 */

import type {
  Member,
  Transaction,
  Announcement,
  EventItem,
  Dept,
  Approval,
  ActivityLogItem,
} from '@/components/admin/dashboard/contexts/AppDataContext';
import type {
  BackendMember,
  BackendIncomeTransaction,
  BackendExpenseTransaction,
  BackendAnnouncement,
  BackendDepartment,
  BackendDepartmentActivity,
  BackendExpenseRequest,
  ActivityFeedItem,
} from './dashboardApi';

/** Map backend member to frontend Member */
export function mapBackendMember(b: BackendMember): Member {
  const status = (b.membership_status || 'ACTIVE').toUpperCase();
  return {
    id: b.id,
    name: b.full_name || [b.first_name, b.last_name].filter(Boolean).join(' ') || 'Unknown',
    email: (b.email as string) || '',
    phone:
      (b.phone_number as string) || (b.location as { phone_primary?: string })?.phone_primary || '',
    role: 'Member',
    joinedDate: (b.member_since as string) || new Date().toISOString().slice(0, 10),
    status: status === 'ACTIVE' ? 'Active' : 'Inactive',
  };
}

/** Map backend income transaction to frontend Transaction */
export function mapBackendIncomeTransaction(b: BackendIncomeTransaction): Transaction {
  return {
    id: b.id,
    date: (b.transaction_date || '').slice(0, 10),
    description: (b.contributor_display as string) || b.category_name || 'Income',
    type: 'Income',
    category: b.category_name || 'Income',
    amount: parseFloat(String(b.amount || 0)),
  };
}

/** Map backend expense transaction to frontend Transaction */
export function mapBackendExpenseTransaction(b: BackendExpenseTransaction): Transaction {
  return {
    id: b.id,
    date: (b.transaction_date || '').slice(0, 10),
    description: (b.description as string) || b.category_name || 'Expense',
    type: 'Expense',
    category: (b.category_name as string) || 'Expense',
    amount: parseFloat(String(b.amount || 0)),
  };
}

/** Map backend announcement to frontend Announcement */
export function mapBackendAnnouncement(b: BackendAnnouncement): Announcement {
  const status = (b.status || 'DRAFT').toUpperCase();
  const priority = (b.priority || 'MEDIUM').toUpperCase();
  return {
    id: b.id,
    date:
      ((b.publish_at || b.created_at) as string)?.slice(0, 10) ||
      new Date().toISOString().slice(0, 10),
    title: (b.title as string) || '',
    message: (b.content as string) || '',
    priority: priority === 'HIGH' ? 'High' : priority === 'LOW' ? 'Low' : 'Medium',
    status: status === 'PUBLISHED' ? 'Published' : 'Draft',
  };
}

/** Map backend department activity to frontend EventItem */
export function mapBackendActivityToEvent(b: BackendDepartmentActivity): EventItem {
  const dept = b.department as { name?: string } | undefined;
  return {
    id: b.id,
    title: (b.title as string) || 'Event',
    date: (b.start_date || '').slice(0, 10),
    time: (b.start_time as string) || '00:00',
    department: dept?.name,
    type: 'Event',
    status: 'Final',
    location: b.location as string | undefined,
  };
}

/** Map backend department to frontend Dept */
export function mapBackendDepartment(b: BackendDepartment): Dept {
  return {
    id: b.id,
    name: (b.name as string) || '',
    leader: (b.head_name as string) || '',
    members: (b.member_count as number) || 0,
    meetingDay: '',
    status: b.is_active ? 'Active' : 'Inactive',
  };
}

/** Map backend expense request to frontend Approval */
export function mapBackendExpenseRequestToApproval(b: BackendExpenseRequest): Approval {
  const status = (b.status || '').toUpperCase();
  const isPending = [
    'SUBMITTED',
    'DEPT_HEAD_APPROVED',
    'FIRST_ELDER_APPROVED',
    'TREASURER_APPROVED',
    'APPROVED',
  ].includes(status);
  return {
    id: b.id,
    name: (b.request_number as string) || 'Expense Request',
    description: (b.purpose as string) || (b.department_name as string) || 'Pending approval',
    role: 'Finance',
    status: isPending ? 'Pending' : status === 'REJECTED' ? 'Rejected' : 'Approved',
    linkedPage: 'treasury',
    amount: parseFloat(String(b.amount_requested || 0)) || undefined,
  };
}

/**
 * Prefer church name over UUID in descriptions for older audit rows (API already exposes church_name).
 */
function humanizeActivityDescription(a: ActivityFeedItem): string {
  let desc = (a.description || '').trim();
  const cn = a.church_name?.trim();
  const oid = a.object_id?.trim();
  const model = (a.model_name || '').toLowerCase();
  if (cn && oid && model === 'church') {
    const escaped = oid.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    desc = desc.replace(new RegExp(`\\(ID:\\s*${escaped}\\)`, 'gi'), `(${cn})`);
  }

  const actorEmail = a.user_email?.trim();
  const actorName = a.user_display?.trim();
  if (actorEmail && actorName && actorName !== actorEmail && desc.endsWith(actorEmail)) {
    desc = `${desc.slice(0, -actorEmail.length)}${actorName}`;
  }

  return desc;
}

/** Infer activity type from audit log model_name */
function inferActivityType(modelName: string): ActivityLogItem['type'] {
  const m = (modelName || '').toLowerCase();
  if (m.includes('member')) {
    return 'member';
  }
  if (m.includes('transaction') || m.includes('income') || m.includes('expense')) {
    return 'transaction';
  }
  if (m.includes('expenserequest') || m.includes('approval')) {
    return 'approval';
  }
  if (m.includes('announcement')) {
    return 'announcement';
  }
  if (m.includes('activity') || m.includes('event')) {
    return 'event';
  }
  if (m.includes('department')) {
    return 'department';
  }
  return 'system';
}

/** Map backend activity feed item to frontend ActivityLogItem */
export function mapBackendActivityToLogItem(a: ActivityFeedItem): ActivityLogItem {
  return {
    id: a.id,
    title: a.action_display || a.action || 'Activity',
    subtitle: humanizeActivityDescription(a),
    timestamp: a.created_at,
    type: inferActivityType(a.model_name || ''),
  };
}
