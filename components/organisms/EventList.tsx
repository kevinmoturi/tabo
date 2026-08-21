import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboText } from '../atoms/TaboText';
import { EventRow } from '../molecules/EventRow';
import { getDummyEvents, type DisplayEvent } from '../../src/data/dummyEvents';
import {
  clearUnlockEvents,
  getUnlockEvents,
  type UnlockEvent,
} from '../../src/utils/UnlockLogger';
import { dark, spacing } from '../../src/theme';

interface EventListFooterProps {
  onRefresh: () => void;
  onClear: () => void;
}

function EventListFooter({ onRefresh, onClear }: EventListFooterProps) {
  return (
    <View style={styles.footer}>
      <TaboButton variant="secondary" onPress={onRefresh}>
        Refresh
      </TaboButton>
      <View style={styles.clearSpacer} />
      <TaboButton variant="alert" onPress={onClear}>
        Clear all
      </TaboButton>
    </View>
  );
}

function toDisplayEvent(event: UnlockEvent): DisplayEvent {
  return {
    ...event,
    status: event.latitude != null ? 'ok' : 'warn',
  };
}

export function EventList() {
  const [events, setEvents] = useState<DisplayEvent[]>([]);

  const load = async () => {
    const stored = await getUnlockEvents();
    const realEvents = stored.map(toDisplayEvent);
    const merged = [...realEvents, ...getDummyEvents()];
    setEvents(merged);
  };

  const handleClear = async () => {
    await clearUnlockEvents();
    setEvents(getDummyEvents());
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <FlatList
      data={events}
      keyExtractor={(_, index) => index.toString()}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <EventRow
          time={item.time}
          latitude={item.latitude}
          longitude={item.longitude}
          status={item.status}
        />
      )}
      ListEmptyComponent={
        <View style={styles.empty}>
          <TaboText variant="body" color={dark.text2} align="center" style={styles.emptyText}>
            No unlock events recorded yet.
          </TaboText>
        </View>
      }
      ListFooterComponent={
        events.length > 0 ? (
          <EventListFooter onRefresh={load} onClear={handleClear} />
        ) : undefined
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.huge,
  },
  empty: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    width: '100%',
  },
  footer: {
    marginTop: spacing.lg,
  },
  clearSpacer: {
    height: spacing.sm,
  },
});
