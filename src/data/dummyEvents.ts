import type { UnlockEvent } from '../utils/UnlockLogger';

export type EventStatus = 'ok' | 'warn' | 'alert' | 'mist';

export interface DisplayEvent extends UnlockEvent {
  status: EventStatus;
}

const now = new Date();

function minutesAgo(minutes: number): string {
  return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number): string {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const DUMMY_EVENTS: DisplayEvent[] = [
  {
    time: minutesAgo(2),
    latitude: -1.2921,
    longitude: 36.8219,
    accuracy: 8,
    status: 'ok',
  },
  {
    time: hoursAgo(3),
    latitude: -1.2921,
    longitude: 36.8219,
    accuracy: 12,
    status: 'ok',
  },
  {
    time: hoursAgo(7),
    latitude: -1.2995,
    longitude: 36.8143,
    accuracy: 24,
    status: 'ok',
  },
  {
    time: hoursAgo(12),
    status: 'warn',
  },
  {
    time: daysAgo(1),
    latitude: -1.2921,
    longitude: 36.8219,
    accuracy: 10,
    status: 'ok',
  },
  {
    time: daysAgo(2),
    latitude: -1.2865,
    longitude: 36.8932,
    accuracy: 18,
    status: 'alert',
  },
  {
    time: daysAgo(3),
    latitude: -1.2921,
    longitude: 36.8219,
    accuracy: 14,
    status: 'ok',
  },
];

export const DUMMY_ALERT = {
  title: 'Intruder detected',
  body: 'An unauthorised unlock was recorded 2 days ago in a different location. Review the event now.',
};

export function getDummyEvents(): DisplayEvent[] {
  return DUMMY_EVENTS;
}

export function getRecentDummyEvents(count = 3): DisplayEvent[] {
  return DUMMY_EVENTS.slice(0, count);
}
