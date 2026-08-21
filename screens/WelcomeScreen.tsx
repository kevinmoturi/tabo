import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboButton } from '../components/atoms/TaboButton';
import { TaboLogo } from '../components/atoms/TaboLogo';
import { TaboText } from '../components/atoms/TaboText';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type WelcomeNav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNav>();

  return (
    <SafeAreaView style={styles.container}>
      <TaboLogo width={180} height={180} style={styles.logo} />
      <TaboText variant="h2" color={dark.text} align="center" style={styles.tagline}>
        Discreet device protection
      </TaboText>
      <TaboText variant="body" color={dark.text2} align="center" style={styles.body}>
        One blue thing per screen. Always the thing you touch.
      </TaboText>
      <View style={styles.actions}>
        <TaboButton onPress={() => navigation.navigate('Auth', { screen: 'SignUp' })}>
          Create account
        </TaboButton>
        <View style={styles.spacer} />
        <TaboButton
          variant="secondary"
          onPress={() => navigation.navigate('Auth', { screen: 'Login' })}>
          Sign in
        </TaboButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  logo: {
    marginBottom: spacing.xxl,
    alignSelf: 'center',
  },
  tagline: {
    width: '100%',
    marginBottom: spacing.sm,
  },
  body: {
    width: '100%',
  },
  actions: {
    marginTop: spacing.xxl,
  },
  spacer: {
    height: spacing.md,
  },
});
