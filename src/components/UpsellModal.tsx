import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { ROUTES } from '@/constants/routes';
import { AppModal } from './AppModal';
import { AppText } from './AppText';
import { Button } from './Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function UpsellModal({ visible, onClose, title = 'Go Premium', message }: Props) {
  const { colors } = useTheme();
  return (
    <AppModal visible={visible} onClose={onClose} variant="center">
      <View style={[styles.badge, { backgroundColor: colors.accent }]}>
        <Ionicons name="flash" size={28} color={colors.onAccent} />
      </View>
      <AppText variant="h2" center>
        {title}
      </AppText>
      <AppText variant="body" tone="secondary" center style={{ marginTop: 8, marginBottom: 20 }}>
        {message}
      </AppText>
      <Button
        title="See Premium — £1.99/month"
        onPress={() => {
          onClose();
          router.push(ROUTES.upgrade);
        }}
      />
      <Button title="Not now" variant="ghost" onPress={onClose} style={{ marginTop: 8 }} />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, borderRadius: 28, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
});
