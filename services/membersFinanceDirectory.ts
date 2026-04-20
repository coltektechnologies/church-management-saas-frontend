import { getMembersListStrict } from '@/lib/dashboardApi';
import {
  mapDirectoryMemberOnly,
  mapTreasuryMemberToFinanceUi,
} from '@/components/treasury/membersFinance/mapTreasuryContributors';
import type { MemberContribution } from '@/types/memberFinance';
import { fetchMemberContributions, type TreasuryFilters } from '@/services/treasuryService';

/**
 * Full church roster merged with aggregated contribution stats for the treasury members-finance UI.
 *
 * The analytics `member-contributions` endpoint only returns people who already have income
 * transactions linked to a member. That screen should still list everyone in `GET /members/members/`,
 * with zeros when there are no linked transactions.
 */
export async function fetchMembersFinanceMerged(
  filters?: TreasuryFilters
): Promise<MemberContribution[]> {
  const [membersList, contribRows] = await Promise.all([
    getMembersListStrict(250),
    fetchMemberContributions(filters),
  ]);

  const contribById = new Map(contribRows.map((c) => [c.id, c]));
  const rosterIds = new Set(membersList.map((m) => String(m.id)));

  const merged: MemberContribution[] = membersList.map((m) => {
    const c = contribById.get(String(m.id));
    return c ? mapTreasuryMemberToFinanceUi(c) : mapDirectoryMemberOnly(m);
  });

  for (const c of contribRows) {
    if (!rosterIds.has(String(c.id))) {
      merged.push(mapTreasuryMemberToFinanceUi(c));
    }
  }

  merged.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return merged;
}
