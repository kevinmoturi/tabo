import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { TaboButton } from '../atoms/TaboButton';
import { TaboText } from '../atoms/TaboText';
import { EventRow } from '../molecules/EventRow';
import { getDummyEvents, type DisplayEvent } from '../../src/data/dummyEvents';
import {
  clearEvents,
  getEvents,
  type UnlockAttemptEvent,
} from '../../src/utils/UnlockAttempts';
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

const EVENT_LABELS: Record<UnlockAttemptEvent['type'], string> = {
  UNLOCK_FAILED: 'Failed unlock attempt',
  UNLOCK_SUCCEEDED: 'Unlocked',
  ADMIN_ENABLED: 'Protection turned on',
  ADMIN_DISABLED: 'Protection turned off',
  BOOT: 'Phone switched on',
};

const EVENT_TONES: Record<UnlockAttemptEvent['type'], DisplayEvent['status']> = {
  UNLOCK_FAILED: 'alert',
  UNLOCK_SUCCEEDED: 'ok',
  ADMIN_ENABLED: 'ok',
  ADMIN_DISABLED: 'warn',
  BOOT: 'mist',
};

function toDisplayEvent(event: UnlockAttemptEvent): DisplayEvent {
  const label = EVENT_LABELS[event.type] ?? event.type;
  return {
    time: new Date(event.at).toISOString(),
    status: EVENT_TONES[event.type] ?? 'mist',
    label:
      event.type === 'UNLOCK_FAILED' && event.attemptNo
        ? `${label} (#${event.attemptNo} in that run)`
        : label,
  };
}

export function EventList() {
  const [events, setEvents] = useState<DisplayEvent[]>([]);

  const load = async () => {
    const stored = await getEvents();
    const realEvents = stored.map(toDisplayEvent);
    // Dummy rows stay until the demo data is retired, but real events lead.
    const merged = [...realEvents, ...getDummyEvents()];
    setEvents(merged);
  };

  const handleClear = async () => {
    await clearEvents();
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
          label={item.label}
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
