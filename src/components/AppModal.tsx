import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/useTheme';
import { AppText } from './AppText';

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** 'sheet' slides from the bottom, 'center' is a dialog. */
  variant?: 'sheet' | 'center';
  fullHeight?: boolean;
}

export function AppModal({ visible, onClose, title, children, variant = 'sheet', fullHeight }: Props) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const sheet = variant === 'sheet';
  return (
    <Modal visible={visible} transparent animationType={sheet ? 'slide' : 'fade'} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.backdrop, { backgroundColor: colors.overlay, justifyContent: sheet ? 'flex-end' : 'center' }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close" />
        <View
          style={[
            sheet ? styles.sheet : styles.dialog,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              borderBottomLeftRadius: sheet ? 0 : radius.xl,
              borderBottomRightRadius: sheet ? 0 : radius.xl,
              paddingBottom: sheet ? Math.max(insets.bottom, 16) : 20,
            },
            fullHeight && { height: '88%' },
          ]}
        >
          {title ? (
            <View style={styles.header}>
              <AppText variant="h3" style={{ flex: 1 }}>
                {title}
              </AppText>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close" accessibilityRole="button">
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
          ) : null}
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: { padding: 20, borderWidth: 1, maxHeight: '92%' },
  dialog: { marginHorizontal: 24, padding: 20, borderWidth: 1 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
});
