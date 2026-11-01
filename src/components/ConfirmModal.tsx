import React from 'react';
import { View } from 'react-native';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive,
  loading,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AppModal visible={visible} onClose={onCancel} variant="center">
      <AppText variant="h3">{title}</AppText>
      <AppText variant="body" tone="secondary" style={{ marginTop: 10, marginBottom: 20 }}>
        {message}
      </AppText>
      <View style={{ gap: 10 }}>
        <Button
          title={confirmLabel}
          variant={destructive ? 'danger' : 'primary'}
          onPress={onConfirm}
          loading={loading}
        />
        <Button title={cancelLabel} variant="outline" onPress={onCancel} disabled={loading} />
      </View>
    </AppModal>
  );
}
