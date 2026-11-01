import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/AppText';
import { Banner } from '@/components/Banner';
import { EmptyState } from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { usePremium } from '@/hooks/usePremium';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { ROUTES } from '@/constants/routes';
import { CHAT_DISCLAIMER } from '@/data/legal';
import type { ChatMessage } from '@/types';
import { formatDateTime } from '@/utils/date';
import { errorMessage } from '@/utils/validation';

export default function Chat() {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { isPremium } = usePremium();
  const userId = useAuthStore((s) => s.session?.user.id);
  const { messages, loaded, fetchMessages, send, subscribe, markRead } = useChatStore();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    if (!userId || !isPremium) return;
    fetchMessages().catch(() => {});
    return subscribe(userId);
  }, [userId, isPremium, fetchMessages, subscribe]);

  useEffect(() => {
    if (messages.length) {
      markRead().catch(() => {});
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length, markRead]);

  if (!isPremium) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
        <EmptyState
          icon="chatbubbles-outline"
          title="Chat with your coach"
          message="Premium members can send questions directly to our qualified personal trainer."
          actionLabel="Upgrade to Premium"
          onAction={() => router.replace(ROUTES.upgrade)}
        />
      </View>
    );
  }

  const doSend = async (body: string) => {
    if (!userId) return;
    setSending(true);
    try {
      await send(userId, body);
      setText('');
    } catch (e) {
      Alert.alert('Message not sent', errorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const onSend = () => {
    const body = text.trim();
    if (!body || sending) return;
    const isFirst = !messages.some((m) => m.sender === 'user');
    if (isFirst) {
      // Disclaimer is shown again (and must be acknowledged) before the first message.
      Alert.alert('Before you send', CHAT_DISCLAIMER, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'I understand — send', onPress: () => doSend(body) },
      ]);
    } else {
      doSend(body);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Banner tone="warning" icon="information-circle-outline" message={CHAT_DISCLAIMER} />
      </View>
      {!loaded ? (
        <ActivityIndicator color={colors.accentText} style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubble-ellipses-outline"
              title="Ask your coach anything"
              message="Training, nutrition, technique — we usually reply within 2 working days. For medical emergencies call 999 or NHS 111."
            />
          }
          renderItem={({ item }) => {
            const mine = item.sender === 'user';
            return (
              <View style={[styles.bubbleWrap, { alignItems: mine ? 'flex-end' : 'flex-start' }]}>
                {!mine ? (
                  <AppText variant="caption" tone="accent" weight="700" style={{ marginBottom: 2 }}>
                    Coach
                  </AppText>
                ) : null}
                <View
                  style={[
                    styles.bubble,
                    {
                      backgroundColor: mine ? colors.accent : colors.surfaceAlt,
                      borderRadius: radius.lg,
                      borderBottomRightRadius: mine ? 4 : radius.lg,
                      borderBottomLeftRadius: mine ? radius.lg : 4,
                    },
                  ]}
                >
                  <AppText style={{ color: mine ? colors.onAccent : colors.text }}>{item.message}</AppText>
                </View>
                <AppText variant="caption" tone="muted" style={{ marginTop: 2 }}>
                  {formatDateTime(item.created_at)}
                </AppText>
              </View>
            );
          }}
        />
      )}
      <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type your question…"
          placeholderTextColor={colors.textMuted}
          multiline
          maxLength={2000}
          style={[styles.input, { color: colors.text, backgroundColor: colors.inputBackground, borderColor: colors.border, borderRadius: radius.md }]}
          accessibilityLabel="Message"
        />
        <Pressable
          onPress={onSend}
          disabled={!text.trim() || sending}
          style={[styles.send, { backgroundColor: colors.accent, opacity: !text.trim() || sending ? 0.5 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          {sending ? <ActivityIndicator color={colors.onAccent} /> : <Ionicons name="arrow-up" size={22} color={colors.onAccent} />}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubbleWrap: { marginBottom: 12 },
  bubble: { maxWidth: '85%', paddingHorizontal: 14, paddingVertical: 10 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, gap: 8, borderTopWidth: StyleSheet.hairlineWidth },
  input: { flex: 1, borderWidth: 1, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, maxHeight: 120, fontSize: 16 },
  send: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
