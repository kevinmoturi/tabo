import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboCard } from '../components/atoms/TaboCard';
import { TaboText } from '../components/atoms/TaboText';
import { SettingsSection } from '../components/organisms/SettingsSection';
import { useSession } from '../src/hooks/useSession';
import { useAuth } from '../src/redux/hooks';
import { useMeQuery } from '../src/redux/services/auth';
import { showSuccess } from '../src/utils/snackbar';
import { openLocationSettings } from '../src/utils/UnlockLogger';
import { dark, spacing } from '../src/theme';
import type { MainTabParamList, RootStackParamList } from '../src/types/navigation';

type RootNav = NativeStackNavigationProp<RootStackParamList>;

type SettingsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Settings'>,
  RootNav
>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsNav>();
  const { user: storedUser, isAuthenticated } = useAuth();
  const { signOut } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  // The slice holds whatever the last login/bootstrap saw; this keeps the
  // header honest if the profile changed on another device.
  const { data } = useMeQuery(undefined, { skip: !isAuthenticated });
  const user = data?.user ?? storedUser;

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    showSuccess('Signed out.');
    // The tab navigator cannot host 'Auth' — the reset has to land on the root
    // stack so the signed-in tabs are dropped rather than stacked behind login.
    const root = navigation.getParent<RootNav>();
    (root ?? navigation).reset({
      index: 0,
      routes: [{ name: 'Auth', params: { screen: 'Login' } }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <TaboText variant="h1" color={dark.text} style={styles.title}>
          Settings
        </TaboText>
        <TaboCard style={styles.profile}>
          <TaboText variant="h2" color={dark.text}>
            {user?.name ?? 'Tabo user'}
          </TaboText>
          <TaboText variant="body-sm" color={dark.text3}>
            {user?.email ?? 'Not signed in'}
          </TaboText>
        </TaboCard>
        <SettingsSection
          title="Permissions"
          rows={[
            {
              icon: 'MapPin',
              label: 'Location access',
              value: 'Required for unlock logging',
              onPress: openLocationSettings,
            },
            {
              icon: 'Bell',
              label: 'Notifications',
              value: 'Get intruder alerts',
              onPress: () => navigation.navigate('Permissions'),
            },
            {
              icon: 'Camera',
              label: 'Camera access',
              value: 'Capture evidence',
              onPress: () => navigation.navigate('Permissions'),
            },
          ]}
        />
        <SettingsSection
          title="Account"
          rows={[
            {
              icon: 'User',
              label: 'Auth details',
              value: 'Profile, sessions and sign-in info',
              onPress: () => navigation.navigate('Account'),
            },
            {
              icon: 'CreditCard',
              label: 'Subscription',
              value: 'Free plan',
              onPress: () => navigation.navigate('Plans'),
            },
            {
              icon: 'Shield',
              label: 'Security',
              value: 'Change your password',
              onPress: () => navigation.navigate('ChangePassword'),
            },
          ]}
        />
        <View style={styles.footer}>
          <TaboButton
            variant="alert"
            disabled={signingOut}
            leftIcon={
              signingOut ? (
                <ActivityIndicator size="small" color={dark.onBrand} />
              ) : undefined
            }
            onPress={handleSignOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </TaboButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
  },
  scroll: {
    flex: 1,
  },
  title: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  profile: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
