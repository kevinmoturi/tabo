import { useEffect, useState } from 'react';
import {
  Button,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import {
  clearUnlockEvents,
  getUnlockEvents,
  openLocationSettings,
  startUnlockListener,
  syncPendingNativeEvents,
  UnlockEvent,
} from './src/utils/UnlockLogger';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [events, setEvents] = useState<UnlockEvent[]>([]);

  const refresh = async () => {
    const stored = await getUnlockEvents();
    setEvents(stored);
  };

  const handleClear = async () => {
    await clearUnlockEvents();
    setEvents([]);
  };

  useEffect(() => {
    syncPendingNativeEvents().then(refresh);
    const stop = startUnlockListener();
    return stop;
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Unlock Events</Text>
      <Text style={styles.subtitle}>
        Detects successful device unlocks and stores time + GPS location. For
        location while the app is closed, enable "Allow all the time" in
        Location settings.
      </Text>
      <Button title="Refresh" onPress={refresh} />
      <View style={styles.spacer} />
      <Button title="Open Location Settings" onPress={openLocationSettings} />
      <View style={styles.spacer} />
      <Button title="Clear All" onPress={handleClear} />
      <FlatList
        data={events}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.time}>{item.time}</Text>
            {item.latitude != null && item.longitude != null && (
              <Text style={styles.coords}>
                {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No unlock events recorded yet.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  spacer: {
    height: 8,
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
  },
  coords: {
    fontSize: 12,
    color: '#444',
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    color: '#999',
  },
});

export default App;
