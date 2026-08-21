import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Header } from '../components/molecules/Header';
import { PermissionPrompt } from '../components/organisms/PermissionPrompt';
import { requestLocationPermission } from '../src/utils/UnlockLogger';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type PermissionsNav = NativeStackNavigationProp<RootStackParamList, 'Permissions'>;

export function PermissionsScreen() {
  const navigation = useNavigation<PermissionsNav>();

  const handleGrant = async () => {
    await requestLocationPermission();
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <PermissionPrompt
          type="location"
          onGrant={handleGrant}
          onSkip={() => navigation.goBack()}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
});
