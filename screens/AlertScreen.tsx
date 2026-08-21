import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Header } from '../components/molecules/Header';
import { AlertBanner } from '../components/organisms/AlertBanner';
import { dark, spacing } from '../src/theme';
import type { RootStackParamList } from '../src/types/navigation';

type AlertProps = NativeStackScreenProps<RootStackParamList, 'Alert'>;
type AlertNav = NativeStackNavigationProp<RootStackParamList, 'Alert'>;

export function AlertScreen({ route }: AlertProps) {
  const navigation = useNavigation<AlertNav>();
  const eventId = route.params?.eventId;

  return (
    <SafeAreaView style={styles.container}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.content}>
        <AlertBanner
          title="Intruder detected"
          body={
          eventId
            ? `An unauthorised unlock was recorded for event ${eventId}. Review the location and time now.`
            : 'An unauthorised unlock was recorded on your device. Review the event now.'
        }
        onView={() => navigation.navigate('Main', { screen: 'Events' })}
        onDismiss={() => navigation.goBack()}
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
});
