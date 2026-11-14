'use client';
import { useSyncExternalStore } from 'react';
import { Event } from '../../../lib/google-sheets';
import { getNextEventOccurrence } from '../../event-helpers';
const emptySubscribe = () => () => {};
interface NextOccurrenceBadgeProps {
  event: Event;
  timeZone: string;
  initialLabel: string | null;
  className: string;
  todayClassName?: string;
}
export default function NextOccurrenceBadge({
  event,
  timeZone,
  initialLabel,
  className,
  todayClassName,
}: NextOccurrenceBadgeProps) {
  const label = useSyncExternalStore(
    emptySubscribe,
    () => getNextEventOccurrence(event, timeZone, 90)?.label ?? null,
    () => initialLabel
  );
  if (!label) return null;
  const isToday = label === 'Today';
  return (
    <span className={`${className} ${isToday && todayClassName ? todayClassName : ''}`}>
      {label}
    </span>
  );
}