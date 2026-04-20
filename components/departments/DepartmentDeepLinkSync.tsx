'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { useDepartments } from '@/context/DepartmentsContext';
import {
  fetchDepartmentDetail,
  fetchProgramDetail,
  type DepartmentDetailResponse,
} from '@/lib/departmentsApi';
import { mapDepartmentDetailToProfilePatch } from '@/lib/mapDepartmentMyPortalProfile';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string | null): s is string {
  return !!s && UUID_RE.test(s.trim());
}

/**
 * Reads `?department=` and `?program=` on `/departments/*` routes so notification links
 * open the portal in the department where the request was created. Resolves `department`
 * from `program` when only the latter is present.
 */
export default function DepartmentDeepLinkSync() {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile, updateProfile, portalIdentityLoaded } = useDepartmentProfile();
  const { applyDepartmentDetail } = useDepartments();
  /** program id → department id (avoid refetching program on every render). */
  const programDeptCacheRef = useRef<Map<string, string>>(new Map());

  const sp = searchParams.toString();

  useEffect(() => {
    if (!pathname.startsWith('/departments')) {
      return;
    }
    if (!portalIdentityLoaded) {
      return;
    }

    const deptRaw = searchParams.get('department');
    const progRaw = searchParams.get('program');

    let cancelled = false;

    (async () => {
      let targetDeptId: string | null = isUuid(deptRaw) ? deptRaw.trim() : null;

      if (!targetDeptId && isUuid(progRaw)) {
        const pid = progRaw.trim();
        const cached = programDeptCacheRef.current.get(pid);
        if (cached) {
          targetDeptId = cached;
        } else {
          try {
            const prog = await fetchProgramDetail(pid);
            if (cancelled) {
              return;
            }
            const d = typeof prog.department === 'string' ? prog.department : null;
            if (d) {
              programDeptCacheRef.current.set(pid, d);
            }
            targetDeptId = d;
          } catch {
            return;
          }
        }
      }

      if (!targetDeptId) {
        return;
      }

      const stripDeptFromUrl = () => {
        const next = new URLSearchParams(searchParams.toString());
        next.delete('department');
        const qs = next.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);
      };

      if (targetDeptId === profile.portalDepartmentId) {
        if (searchParams.has('department')) {
          stripDeptFromUrl();
        }
        return;
      }

      try {
        const detail: DepartmentDetailResponse = await fetchDepartmentDetail(targetDeptId);
        if (cancelled) {
          return;
        }
        applyDepartmentDetail(targetDeptId, detail);
        updateProfile(mapDepartmentDetailToProfilePatch(detail));
        stripDeptFromUrl();
      } catch (e) {
        console.warn('[department deep link]', e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    pathname,
    portalIdentityLoaded,
    profile.portalDepartmentId,
    router,
    sp,
    applyDepartmentDetail,
    updateProfile,
    searchParams,
  ]);

  return null;
}
