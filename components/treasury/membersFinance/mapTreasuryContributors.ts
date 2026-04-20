import type { BackendMember } from '@/lib/dashboardApi';
import type { MemberContribution as TreasuryMember } from '@/services/treasuryService';
import type {
  MemberContribution,
  MemberTransaction,
  ContributionType,
} from '@/types/memberFinance';

function classifyType(raw: string): ContributionType {
  const s = (raw || '').toLowerCase();
  if (s.includes('tithe')) {
    return 'Tithe';
  }
  if (s.includes('offering')) {
    return 'Offering';
  }
  if (s.includes('project')) {
    return 'Project';
  }
  return 'Donation';
}

function formatDisplayDate(isoOrStr: string): string {
  const t = Date.parse(isoOrStr);
  if (Number.isNaN(t)) {
    return isoOrStr;
  }
  return new Date(t).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Maps finance API contributor row (see `fetchMemberContributions`) to the members-finance UI model.
 */
export function mapTreasuryMemberToFinanceUi(row: TreasuryMember): MemberContribution {
  const contribs = row.contributions ?? [];
  let titheYTD = 0;
  let offeringsYTD = 0;
  let projectsYTD = 0;

  const transactions: MemberTransaction[] = contribs.map((c, i) => {
    const kind = classifyType(c.type);
    const amt = Number(c.amount) || 0;
    if (kind === 'Tithe') {
      titheYTD += amt;
    } else if (kind === 'Offering') {
      offeringsYTD += amt;
    } else if (kind === 'Project') {
      projectsYTD += amt;
    } else {
      projectsYTD += amt;
    }

    return {
      id: `${row.id}-tx-${i}`,
      type: kind,
      date: formatDisplayDate(c.date),
      receiptNumber: `RCP-${String(i + 1).padStart(4, '0')}`,
      amount: amt,
    };
  });

  const accounted = titheYTD + offeringsYTD + projectsYTD;
  const total = Number(row.totalAmount) || 0;
  if (total > accounted) {
    projectsYTD += total - accounted;
  }

  const ts = contribs.map((c) => Date.parse(c.date)).filter((n) => !Number.isNaN(n));
  const memberSince =
    ts.length > 0
      ? new Date(Math.min(...ts)).toLocaleDateString('en-GB', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

  const shortId = row.id.length > 12 ? row.id.slice(0, 8) : row.id;

  return {
    id: row.id,
    name: row.name,
    memberId: `MID-${shortId}`,
    phone: row.phone || '—',
    avatarUrl: row.avatar || undefined,
    totalYTD: total,
    status: row.status === 'ACTIVE' ? 'Active' : 'Inactive',
    memberSince,
    titheYTD,
    offeringsYTD,
    projectsYTD,
    transactions,
  };
}

/** Member appears in roster but has no income transactions linked in the selected period (or ever). */
export function mapDirectoryMemberOnly(m: BackendMember): MemberContribution {
  const name =
    (m.full_name && String(m.full_name).trim()) ||
    [m.first_name, m.last_name].filter(Boolean).join(' ').trim() ||
    'Unknown';
  const raw = String(m.membership_status ?? '').toUpperCase();
  const status = raw === 'ACTIVE' || raw.includes('ACTIVE') ? 'Active' : 'Inactive';

  let memberSince = '—';
  if (typeof m.member_since === 'string' && m.member_since) {
    memberSince = formatDisplayDate(m.member_since);
  } else if (typeof m.created_at === 'string' && m.created_at) {
    memberSince = formatDisplayDate(m.created_at);
  }

  const sid = String(m.id);
  const shortId = sid.length > 12 ? sid.slice(0, 8) : sid;

  return {
    id: sid,
    name,
    memberId: `MID-${shortId}`,
    phone: String(m.phone_number ?? '') || '—',
    avatarUrl: undefined,
    totalYTD: 0,
    status,
    memberSince,
    titheYTD: 0,
    offeringsYTD: 0,
    projectsYTD: 0,
    transactions: [],
  };
}
