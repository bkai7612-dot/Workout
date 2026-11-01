import React from 'react';
import { Alert, View } from 'react-native';
import { useProfileStore } from '@/store/profileStore';
import type { ThemeMode, WeightUnit } from '@/types';
import { errorMessage } from '@/utils/validation';
import { AppText } from './AppText';
import { SegmentedControl } from './SegmentedControl';
import { ToggleRow } from './ToggleRow';

/** Units, theme, Sunday advice and notification preferences (saved to the profile). */
export function PreferencesSection() {
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  if (!profile) return null;

  const save = (patch: Parameters<typeof updateProfile>[0]) =>
    updateProfile(patch).catch((e) => Alert.alert('Could not save', errorMessage(e)));

  return (
    <View>
      <AppText variant="bodyBold" style={{ marginTop: 4 }}>
        Units
      </AppText>
      <AppText variant="caption" tone="muted" style={{ marginBottom: 8 }}>
        Applies to all weight displays across the app.
      </AppText>
      <SegmentedControl<WeightUnit>
        value={profile.weight_unit}
        onChange={(weight_unit) => save({ weight_unit })}
        options={[
          { value: 'kg', label: 'Kilograms (kg)' },
          { value: 'lbs', label: 'Pounds (lbs)' },
        ]}
      />
      <AppText variant="bodyBold" style={{ marginTop: 18 }}>
        Appearance
      </AppText>
      <AppText variant="caption" tone="muted" style={{ marginBottom: 8 }}>
        "System" follows your device setting.
      </AppText>
      <SegmentedControl<ThemeMode>
        value={profile.dark_mode}
        onChange={(dark_mode) => save({ dark_mode })}
        options={[
          { value: 'system', label: 'System' },
          { value: 'dark', label: 'Dark' },
          { value: 'light', label: 'Light' },
        ]}
      />
      <View style={{ marginTop: 8 }}>
        <ToggleRow
          label="Sunday workout advice"
          description="A weekly review of your training appears on Home every Sunday."
          value={profile.sunday_advice_enabled}
          onChange={(sunday_advice_enabled) => save({ sunday_advice_enabled })}
        />
        <ToggleRow
          label="Notifications"
          description="Workout reminders and coach replies. Coming soon."
          value={profile.notifications_enabled}
          onChange={(notifications_enabled) => save({ notifications_enabled })}
        />
      </View>
    </View>
  );
}
