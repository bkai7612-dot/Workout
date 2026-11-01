import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { ListRow } from '@/components/ListRow';
import { SectionHeader } from '@/components/SectionHeader';
import { ConfirmModal } from '@/components/ConfirmModal';
import { AppModal } from '@/components/AppModal';
import { TextField } from '@/components/TextField';
import { PreferencesSection } from '@/components/PreferencesSection';
import { usePremium } from '@/hooks/usePremium';
import { useAuthStore } from '@/store/authStore';
import { useProfileStore } from '@/store/profileStore';
import { resetUserStores } from '@/store';
import { supabase } from '@/services/supabase';
import { sendPasswordReset } from '@/services/auth';
import { openManageSubscriptions } from '@/services/revenuecat';
import { ROUTES } from '@/constants/routes';
import { ICO_NOTICE } from '@/data/legal';
import { GOAL_LABELS } from '@/data/nutrition';
import { formatDate } from '@/utils/date';
import { errorMessage, validateUsername } from '@/utils/validation';

export default function Profile() {
  const session = useAuthStore((s) => s.session);
  const signOut = useAuthStore((s) => s.signOut);
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const premium = usePremium();

  const [editOpen, setEditOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [savingUsername, setSavingUsername] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const email = session?.user.email ?? '';

  const saveUsername = async () => {
    const v = validateUsername(newUsername);
    if (v) return setUsernameError(v);
    if (newUsername.trim() === profile?.username) return setEditOpen(false);
    setSavingUsername(true);
    try {
      const available = await useProfileStore.getState().isUsernameAvailable(newUsername);
      if (!available) throw new Error('That username is already taken.');
      await updateProfile({ username: newUsername.trim() });
      setEditOpen(false);
    } catch (e) {
      setUsernameError(errorMessage(e));
    } finally {
      setSavingUsername(false);
    }
  };

  const changePassword = async () => {
    if (!email) {
      Alert.alert('No email address', 'Your account uses Apple or Google sign-in, so there is no password to change.');
      return;
    }
    try {
      await sendPasswordReset(email);
      Alert.alert('Check your email', `We've sent a password reset link to ${email}.`);
    } catch (e) {
      Alert.alert('Could not send email', errorMessage(e));
    }
  };

  const confirmSignOut = () =>
    Alert.alert('Sign out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await resetUserStores();
          await signOut();
        },
      },
    ]);

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      // Server-side function deletes the auth user; all user rows cascade (UK GDPR right to erasure).
      const { error } = await supabase.rpc('delete_user_account');
      if (error) throw error;
      await resetUserStores();
      await supabase.auth.signOut().catch(() => {});
      useAuthStore.setState({ session: null });
      setDeleteOpen(false);
      Alert.alert(
        'Account deleted',
        'Your account and all associated data have been permanently deleted. If you had a subscription, remember to cancel it in your App Store / Google Play settings.',
      );
    } catch (e) {
      Alert.alert('Could not delete account', errorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  if (!profile) return <Screen>{null}</Screen>;

  return (
    <Screen>
      <View style={styles.header}>
        <Avatar name={profile.username} />
        <View style={{ marginLeft: 16, flex: 1 }}>
          <AppText variant="h2">{profile.username}</AppText>
          <AppText variant="small" tone="secondary" numberOfLines={1}>
            {email || 'Signed in with Apple/Google'}
          </AppText>
          <AppText variant="caption" tone="accent" weight="700" style={{ marginTop: 4 }}>
            {premium.isPremium ? 'PREMIUM' : 'FREE PLAN'}
            {profile.goal ? ` · ${GOAL_LABELS[profile.goal]}` : ''}
          </AppText>
        </View>
      </View>

      <SectionHeader title="Subscription" />
      <Card>
        {premium.isPremium ? (
          <>
            <AppText variant="h3">Premium {premium.isTrial ? '(free trial)' : ''}</AppText>
            <AppText variant="small" tone="secondary" style={{ marginTop: 4 }}>
              {premium.expiry
                ? `${premium.willRenew ? 'Renews' : 'Expires'} on ${formatDate(premium.expiry)}`
                : 'Active'}
            </AppText>
            <Button title="Chat with your coach" icon="chatbubbles-outline" onPress={() => router.push(ROUTES.chat)} style={{ marginTop: 14 }} />
            <Button
              title="Manage Subscription"
              variant="outline"
              onPress={() => openManageSubscriptions(premium.managementURL)}
              style={{ marginTop: 10 }}
            />
          </>
        ) : (
          <>
            <AppText variant="h3">Free plan</AppText>
            <AppText variant="small" tone="secondary" style={{ marginTop: 4 }}>
              Up to 7 templates · core nutrition tips · weekly review
            </AppText>
            <Button title="Upgrade to Premium — £1.99/month" icon="flash" onPress={() => router.push(ROUTES.upgrade)} style={{ marginTop: 14 }} />
          </>
        )}
      </Card>

      <SectionHeader title="Account" />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow
          icon="at-outline"
          label="Edit username"
          value={profile.username}
          onPress={() => {
            setNewUsername(profile.username);
            setUsernameError(null);
            setEditOpen(true);
          }}
        />
        <ListRow icon="key-outline" label="Change password" onPress={changePassword} />
        <ListRow icon="clipboard-outline" label="Edit fitness profile" onPress={() => router.push(ROUTES.questionnaire)} />
        <ListRow
          icon="medkit-outline"
          label="PAR-Q health check"
          value={profile.parq_completed ? (profile.parq_cleared ? 'Cleared' : 'See GP') : 'Not done'}
          onPress={() => router.push({ pathname: ROUTES.parq, params: { from: 'settings' } })}
        />
        <ListRow icon="log-out-outline" label="Sign out" onPress={confirmSignOut} />
        <ListRow icon="trash-outline" label="Delete account" danger onPress={() => setDeleteOpen(true)} />
      </Card>

      <SectionHeader title="Preferences" actionLabel="All settings" onAction={() => router.push(ROUTES.settings)} />
      <Card>
        <PreferencesSection />
      </Card>

      <SectionHeader title="Legal" />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => router.push(ROUTES.privacy)} />
        <ListRow icon="document-text-outline" label="Terms & Conditions" onPress={() => router.push(ROUTES.terms)} />
      </Card>

      <AppText variant="caption" tone="muted" center style={{ marginTop: 16 }}>
        {ICO_NOTICE}
      </AppText>
      <AppText variant="caption" tone="muted" center style={{ marginTop: 4 }}>
        ProjectBuilt v1.0.0
      </AppText>

      <AppModal visible={editOpen} onClose={() => setEditOpen(false)} title="Edit username">
        <TextField
          label="Username"
          value={newUsername}
          onChangeText={(t) => {
            setNewUsername(t.replace(/\s/g, ''));
            setUsernameError(null);
          }}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          error={usernameError}
          hint="3–20 characters: letters, numbers and underscores."
        />
        <Button title="Save" onPress={saveUsername} loading={savingUsername} />
      </AppModal>

      <ConfirmModal
        visible={deleteOpen}
        title="Delete account"
        message="Are you sure? This permanently deletes your account and all data. This cannot be undone."
        confirmLabel="Delete my account"
        destructive
        loading={deleting}
        onConfirm={deleteAccount}
        onCancel={() => setDeleteOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
});
