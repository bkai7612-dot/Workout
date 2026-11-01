import React, { useState } from 'react';
import { Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { TemplateEditor } from '@/components/TemplateEditor';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { useUnit } from '@/hooks/useUnit';
import { useStartWorkout } from '@/hooks/useStartWorkout';
import { useWorkoutStore, type TemplateInput } from '@/store/workoutStore';
import { errorMessage } from '@/utils/validation';

export default function EditTemplate() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unit = useUnit();
  const startWorkout = useStartWorkout();
  const template = useWorkoutStore((s) => s.templates.find((t) => t.id === id));
  const updateTemplate = useWorkoutStore((s) => s.updateTemplate);
  const [saving, setSaving] = useState(false);

  if (!template) {
    return (
      <Screen edges={[]}>
        <EmptyState icon="alert-circle-outline" title="Template not found" message="It may have been deleted." actionLabel="Go back" onAction={() => router.back()} />
      </Screen>
    );
  }

  const submit = async (input: TemplateInput) => {
    setSaving(true);
    try {
      await updateTemplate(template.id, input);
      router.back();
    } catch (e) {
      Alert.alert('Could not save changes', errorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen edges={[]}>
      <Button title="Start this workout" icon="play" variant="secondary" onPress={() => startWorkout(template)} style={{ marginBottom: 20 }} />
      <TemplateEditor
        key={template.id}
        initial={{ name: template.name, description: template.description, exercises: template.exercises }}
        defaultUnit={unit}
        saving={saving}
        submitLabel="Save changes"
        onSubmit={submit}
      />
    </Screen>
  );
}
