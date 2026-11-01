import React from 'react';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { SectionHeader } from '@/components/SectionHeader';
import { PreferencesSection } from '@/components/PreferencesSection';
import { usePremium } from '@/hooks/usePremium';
import { useProfileStore } from '@/store/profileStore';
import { ROUTES } from '@/constants/routes';
import { ICO_NOTICE } from '@/data/legal';
import { GOAL_LABELS } from '@/data/nutrition';
import { EQUIPMENT_LABELS, LEVEL_LABELS } from '@/data/onboarding';

export default function Settings() {
  const profile = useProfileStore((s) => s.profile);
  const { isPremium } = usePremium();

  return (
    <Screen edges={[]}>
      <SectionHeader title="Preferences" />
      <Card>
        <PreferencesSection />
      </Card>

      <SectionHeader title="Fitness profile" />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow label="Goal" value={profile?.goal ? GOAL_LABELS[profile.goal] : 'Not set'} onPress={() => router.push(ROUTES.questionnaire)} />
        <ListRow label="Level" value={profile?.level ? LEVEL_LABELS[profile.level] : 'Not set'} onPress={() => router.push(ROUTES.questionnaire)} />
        <ListRow label="Equipment" value={profile?.equipment ? EQUIPMENT_LABELS[profile.equipment] : 'Not set'} onPress={() => router.push(ROUTES.questionnaire)} />
        <ListRow label="Training days" value={profile?.days_per_week ? `${profile.days_per_week} / week` : 'Not set'} onPress={() => router.push(ROUTES.questionnaire)} />
        <ListRow
          label="PAR-Q health check"
          value={profile?.parq_completed ? (profile.parq_cleared ? 'Cleared' : 'See GP') : 'Not done'}
          onPress={() => router.push({ pathname: ROUTES.parq, params: { from: 'settings' } })}
        />
      </Card>

      <SectionHeader title="Premium" />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow label={isPremium ? 'Manage Premium' : 'Upgrade to Premium'} icon="flash-outline" onPress={() => router.push(ROUTES.upgrade)} />
        <ListRow label="Chat with your coach" icon="chatbubbles-outline" onPress={() => router.push(isPremium ? ROUTES.chat : ROUTES.upgrade)} />
      </Card>

      <SectionHeader title="Legal" />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow label="Privacy Policy" icon="shield-checkmark-outline" onPress={() => router.push(ROUTES.privacy)} />
        <ListRow label="Terms & Conditions" icon="document-text-outline" onPress={() => router.push(ROUTES.terms)} />
      </Card>
      <AppText variant="caption" tone="muted" center style={{ marginTop: 16 }}>
        {ICO_NOTICE}
      </AppText>
    </Screen>
  );
}
