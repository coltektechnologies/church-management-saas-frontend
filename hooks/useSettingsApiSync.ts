'use client';

import { useEffect, useRef } from 'react';
import {
  getChurchId,
  getChurch,
  getStoredUser,
  getUser,
  mapChurchToProfile,
  mapChurchToServices,
} from '@/lib/settingsApi';
import { useChurchProfile } from '@/components/admin/dashboard/contexts/ChurchProfileContext';
import { useChurch } from '@/components/quicksetup/contexts/ChurchContext';

/**
 * Syncs settings from API into ChurchProfileContext and ChurchContext when user is authenticated.
 * Runs once on mount when church_id is available.
 */
export function useSettingsApiSync() {
  const { updateProfile } = useChurchProfile();
  const { setChurch } = useChurch();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) {
      return;
    }
    const churchId = getChurchId();
    const user = getStoredUser();
    if (!churchId || !user?.id) {
      return;
    }

    hasSynced.current = true;

    const run = async () => {
      const [church, userData] = await Promise.all([getChurch(churchId), getUser(user.id)]);

      if (church) {
        const profilePatch = mapChurchToProfile(church);
        updateProfile(profilePatch as Parameters<typeof updateProfile>[0]);

        const services = mapChurchToServices(church);
        setChurch({
          churchName: church.name,
          logoUrl: church.logo_url ?? null,
          primaryColor: church.primary_color ?? '#0B2A4A',
          accentColor: church.accent_color ?? '#2FC4B2',
          mission: church.mission ?? '',
          website: church.website ?? '',
          services,
        });
      }

      if (userData) {
        const fullName = [userData.first_name, userData.last_name].filter(Boolean).join(' ');
        updateProfile({
          adminName: fullName || (userData.email ?? ''),
          adminEmail: userData.email ?? '',
          adminPhone: userData.phone ?? '',
          avatarUrl: userData.profile_image_url ?? null,
        });
      }
    };

    run().catch(() => {
      hasSynced.current = false;
    });
  }, [updateProfile, setChurch]);
}
