import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TemplateEditor } from '@/components/TemplateEditor';
import { UpsellModal } from '@/components/UpsellModal';
import { useUnit } from '@/hooks/useUnit';
import { usePremium } from '@/hooks/usePremium';
import { useAuthStore } from '@/store/authStore';
import { useWorkoutStore, type TemplateInput } from '@/store/workoutStore';
import { FREE_TEMPLATE_LIMIT } from '@/constants/routes';
import { errorMessage } from '@/utils/validation';

export default function NewTemplate() {
  const unit = useUnit();
  const { isPremium } = usePremium();
  const userId = useAuthStore((s) => s.session?.user.id);
  const templates = useWorkoutStore((s) => s.templates);
  const createTemplate = useWorkoutStore((s) => s.createTemplate);
  const [saving, setSaving] = useState(false);
  const [upsell, setUpsell] = useState(false);

  const submit = async (input: TemplateInput) => {
    if (!userId) return;
    if (!isPremium && templates.length >= FREE_TEMPLATE_LIMIT) {
      setUpsell(true);
      return;
    }
    setSaving(true);
    try {
      await createTemplate(userId, input);
      router.back();
    } catch (e) {
      if (errorMessage(e) === 'TEMPLATE_LIMIT') setUpsell(true);
      else Alert.alert('Could not save template', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={[]}>
      <TemplateEditor defaultUnit={unit} saving={saving} submitLabel="Save template" onSubmit={submit} />
      <UpsellModal
        visible={upsell}
        onClose={() => setUpsell(false)}
        title="Template limit reached"
        message="Upgrade to Premium for unlimited templates."
      />
    </Screen>
  );
}
