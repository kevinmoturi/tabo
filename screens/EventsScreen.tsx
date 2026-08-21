import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/molecules/Header';
import { EventList } from '../components/organisms/EventList';
import { dark } from '../src/theme';

export function EventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Unlock log" />
      <EventList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark.bg,
  },
});
