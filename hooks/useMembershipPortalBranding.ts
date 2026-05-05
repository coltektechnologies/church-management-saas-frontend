'use client';

import { useCallback, useEffect, useState } from 'react';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { getStoredSessionChurchId } from '@/lib/churchSessionBrowser';
import { getAccessToken, getCurrentMemberProfile } from '@/lib/api';
import { displayMemberName } from '@/components/membership/memberProfileDisplay';
import { getChurch } from '@/lib/settingsApi';

export function useMembershipPortalBranding() {
  const { profile } = useChurchProfile();
  const [mounted, setMounted] = useState(false);
  const [headerLoading, setHeaderLoading] = useState(true);
  const [churchTitle, setChurchTitle] = useState('Your church');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [memberLine, setMemberLine] = useState<string | null>(null);

  const loadSidebarContext = useCallback(async () => {
    setHeaderLoading(true);
    try {
      const token = getAccessToken();
      const cid = getStoredSessionChurchId();

      if (token && cid) {
        const [memberRes, churchRes] = await Promise.all([
          getCurrentMemberProfile().catch(() => null),
          getChurch(cid).catch(() => null),
        ]);
        if (memberRes) {
          setMemberLine(displayMemberName(memberRes));
        } else {
          setMemberLine(null);
        }
        if (churchRes?.name?.trim()) {
          setChurchTitle(churchRes.name.trim());
        } else if (profile.churchName?.trim()) {
          setChurchTitle(profile.churchName.trim());
        } else {
          setChurchTitle('Your church');
        }
        if (churchRes?.logo_url) {
          setLogoUrl(churchRes.logo_url);
        } else if (profile.logoUrl) {
          setLogoUrl(profile.logoUrl);
        } else {
          setLogoUrl(null);
        }
      } else {
        setMemberLine(null);
        if (profile.churchName?.trim()) {
          setChurchTitle(profile.churchName.trim());
        }
        setLogoUrl(profile.logoUrl ?? null);
      }
    } finally {
      setHeaderLoading(false);
    }
  }, [profile.churchName, profile.logoUrl]);

  useEffect(() => {
    const p = profile;
    if (p.churchName?.trim()) {
      setChurchTitle(p.churchName.trim());
    }
    if (p.logoUrl) {
      setLogoUrl(p.logoUrl);
    }
    setMounted(true);
    void loadSidebarContext();
  }, [loadSidebarContext, profile]);

  return { mounted, headerLoading, churchTitle, logoUrl, memberLine, reload: loadSidebarContext };
}
