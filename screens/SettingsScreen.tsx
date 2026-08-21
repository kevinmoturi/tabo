import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboCard } from '../components/atoms/TaboCard';
import { TaboText } from '../components/atoms/TaboText';
import { SettingsSection } from '../components/organisms/SettingsSection';
import { openLocationSettings } from '../src/utils/UnlockLogger';
import { dark, spacing } from '../src/theme';
import type { MainTabParamList, RootStackParamList } from '../src/types/navigation';

type SettingsNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Settings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function SettingsScreen() {
  const navigation = useNavigation<SettingsNav>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <TaboText variant="h1" color={dark.text} style={styles.title}>
          Settings
        </TaboText>
        <TaboCard style={styles.profile}>
          <TaboText variant="h2" color={dark.text}>
            Tabo user
          </TaboText>
          <TaboText variant="body-sm" color={dark.text3}>
            user@example.com
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
              icon: 'CreditCard',
              label: 'Subscription',
              value: 'Free plan',
              onPress: () => navigation.navigate('Plans'),
            },
            {
              icon: 'Shield',
              label: 'Security',
              onPress: () => {},
            },
          ]}
        />
        <View style={styles.footer}>
          <TaboButton
            variant="alert"
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
            Sign out
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
