import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboLogo } from '../components/atoms/TaboLogo';
import { TaboText } from '../components/atoms/TaboText';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type SplashNav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export function SplashScreen() {
  const navigation = useNavigation<SplashNav>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <TaboLogo width={200} height={200} />
      <TaboText variant="body-sm" color={dark.text3} style={styles.tagline}>
        The watching lens
      </TaboText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  tagline: {
    marginTop: spacing.xl,
  },
});
