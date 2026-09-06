import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaboLogo } from '../components/atoms/TaboLogo';
import { TaboText } from '../components/atoms/TaboText';
import { useAppDispatch } from '../src/redux/hooks';
import { useLazyMeQuery } from '../src/redux/services/auth';
import { clearUser, setUser } from '../src/redux/slices/authSlice';
import { clearTokens, getAccessToken, getExpiry } from '../src/utils/token';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type SplashNav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

const MIN_SPLASH_MS = 1200;

export function SplashScreen() {
  const navigation = useNavigation<SplashNav>();
  const dispatch = useAppDispatch();
  const [fetchMe] = useLazyMeQuery();

  useEffect(() => {
    let cancelled = false;

    /**
     * Restores the stored session before deciding where to land. An expired
     * access token is not by itself a sign-out — the base query silently
     * refreshes it, and only a failed refresh sends the user back to
     * onboarding.
     */
    const bootstrap = async () => {
      // Runs alongside the session check so a fast network does not make the
      // logo flash by.
      const held = new Promise<void>(resolve => {
        setTimeout(resolve, MIN_SPLASH_MS);
      });

      let signedIn = false;
      const accessToken = await getAccessToken();

      if (accessToken) {
        try {
          const { user } = await fetchMe().unwrap();
          if (user) {
            dispatch(setUser({ user, expiresAt: await getExpiry() }));
            signedIn = true;
          }
        } catch {
          await clearTokens();
          dispatch(clearUser());
        }
      } else {
        dispatch(clearUser());
      }

      await held;
      if (cancelled) {
        return;
      }

      if (signedIn) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main', params: { screen: 'Home' } }],
        });
      } else {
        navigation.replace('Onboarding');
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [dispatch, fetchMe, navigation]);

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
