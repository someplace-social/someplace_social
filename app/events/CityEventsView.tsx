'use client';
import {
  useState,
  useMemo,
  useDeferredValue,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';
import Link from 'next/link';
import {
  CityConfig,
  getCityPriceConfig,
  getCityTimeZone,
} from '../lib/cities';
import type { Event } from '../lib/google-sheets';
import {
  indexEvents,
  filterAndCountEvents,
  isDateRecurringEvent,
} from './utils';
import {
  getCityToday,
  getEventSlug,
  groupEventsForDirectory,
  resolveEventBySlug,
} from './event-helpers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DayPicker from './components/DayPicker';
import FilterControls from './components/FilterControls';
import EventCard from './components/EventCard';
import SuggestEditModal from './components/SuggestEditModal';
import CityHeroCard from './components/CityHeroCard';
import styles from './EventsView.module.css';

const emptySubscribe = () => () => {};
const DAY_NAMES_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];
const TIME_GROUPS = [
  { name: 'Morning', predicate: (h: number) => h < 12 },
  { name: 'Afternoon', predicate: (h: number) => h >= 12 && h < 17 },
  { name: 'Evening', predicate: (h: number) => h >= 17 && h < 20 },
  { name: 'Night', predicate: (h: number) => h >= 20 },
];
const ALL_EVENTS_IDX = 7;

interface CityEventsViewProps {
  city: CityConfig;
  initialEvents?: Event[];
  lastUpdated?: string | null;
  initialTab?: string;
}

export default function CityEventsView({
  city,
  initialEvents = [],
  lastUpdated = null,
  initialTab,
}: CityEventsViewProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const priceConfig = useMemo(() => getCityPriceConfig(city), [city]);
  const timeZone = useMemo(() => getCityTimeZone(city), [city]);
  const [activeDayIdx, setActiveDayIdx] = useState(() =>
    initialTab === 'all' ? ALL_EVENTS_IDX : 0
  );
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [selectedMaxPrice, setSelectedMaxPrice] = useState<{
    citySlug: string;
    value: number;
  } | null>(null);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [editModalEvent, setEditModalEvent] = useState<Event | null>(null);
  const pendingScrollIdRef = useRef<string | null>(null);
  const handledInitialHashRef = useRef<string | null>(null);

  const maxPrice =
    selectedMaxPrice && selectedMaxPrice.citySlug === city.slug
      ? selectedMaxPrice.value
      : priceConfig.maxPrice;
  const handlePriceChange = useCallback(
    (val: number) => {
      setSelectedMaxPrice({ citySlug: city.slug, value: val });
    },
    [city.slug]
  );

  const allEvents = initialEvents;
  const eventKeyMap = useMemo(() => {
    const map = new Map<Event, string>();
    const seen = new Map<string, number>();
    allEvents.forEach((ev) => {
      const base = getEventSlug(ev);
      const count = seen.get(base) || 0;
      seen.set(base, count + 1);
      map.set(ev, count === 0 ? base : `${base}-${count}`);
    });
    return map;
  }, [allEvents]);

  const rollingWeek = useMemo(() => {
    const today = getCityToday(timeZone);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, [timeZone]);

  const indexedEvents = useMemo(() => {
    return indexEvents(allEvents, rollingWeek, priceConfig.currencyCode);
  }, [allEvents, rollingWeek, priceConfig.currencyCode]);

  const syncEventHash = useCallback((slug: string | null) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const nextHash = slug ? `#${slug}` : '';
    if (url.hash === nextHash) return;
    url.hash = nextHash;
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState(window.history.state, '', nextUrl);
  }, []);

  const openEventFromHash = useCallback(
    (clearIfEmpty: boolean) => {
      if (typeof window === 'undefined') return;
      const rawHash = window.location.hash.replace(/^#/, '').trim();
      if (!rawHash) {
        if (clearIfEmpty) {
          setOpenEventId(null);
        }
        return;
      }
      const resolved = resolveEventBySlug(allEvents, rawHash);
      if (!resolved) return;
      const targetIdx = allEvents.indexOf(resolved.event);
      const indexedTarget = targetIdx >= 0 ? indexedEvents[targetIdx] : null;
      const firstActiveDayIdx = indexedTarget
        ? indexedTarget.activeDays.findIndex(Boolean)
        : -1;
      const key = eventKeyMap.get(resolved.event) || resolved.canonicalSlug;
      setActiveDayIdx((prevDay) => {
        if (prevDay === ALL_EVENTS_IDX) return ALL_EVENTS_IDX;
        if (indexedTarget && indexedTarget.activeDays[prevDay]) return prevDay;
        return firstActiveDayIdx >= 0 ? firstActiveDayIdx : prevDay;
      });
      setOpenEventId(key);
      syncEventHash(resolved.canonicalSlug);
      pendingScrollIdRef.current = `event-card-${key}`;
    },
    [allEvents, eventKeyMap, indexedEvents, syncEventHash]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let rafId: number | null = null;
    if (handledInitialHashRef.current !== city.slug) {
      rafId = window.requestAnimationFrame(() => {
        handledInitialHashRef.current = city.slug;
        openEventFromHash(false);
      });
    }
    const handleHashChange = () => {
      openEventFromHash(true);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [city.slug, openEventFromHash]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkTabParam = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'all') {
        setActiveDayIdx(ALL_EVENTS_IDX);
      }
    };
    checkTabParam();
    window.addEventListener('popstate', checkTabParam);
    return () => window.removeEventListener('popstate', checkTabParam);
  }, []);

  useEffect(() => {
    if (!pendingScrollIdRef.current) return;
    const domId = pendingScrollIdRef.current;
    const el = document.getElementById(domId);
    if (!el) return;
    pendingScrollIdRef.current = null;
    const rafId = window.requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [activeDayIdx, openEventId]);

  const isAllEventsTab = activeDayIdx === ALL_EVENTS_IDX;
  const activeDate = isAllEventsTab
    ? rollingWeek[0]
    : rollingWeek[activeDayIdx] || rollingWeek[0];

  const activityFrequencies = useMemo(() => {
    const counts = new Map<string, number>();
    allEvents.forEach((ev) => {
      ev.activities.forEach((act) => {
        const trimmed = act.trim();
        if (trimmed) {
          counts.set(trimmed, (counts.get(trimmed) || 0) + 1);
        }
      });
    });
    return counts;
  }, [allEvents]);

  const activities = useMemo(() => {
    return Array.from(activityFrequencies.keys()).sort((a, b) => {
      const countDiff = (activityFrequencies.get(b) || 0) - (activityFrequencies.get(a) || 0);
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });
  }, [activityFrequencies]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => {
      if (ev.area && ev.area.trim().length > 0 && ev.area.trim().length < 35) {
        set.add(ev.area.trim());
      }
    });
    return Array.from(set).sort();
  }, [allEvents]);

  const toggleTime = useCallback((tName: string) => {
    setSelectedTimes((prev) =>
      prev.includes(tName) ? prev.filter((t) => t !== tName) : [...prev, tName]
    );
  }, []);

  const toggleActivity = useCallback((act: string) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  }, []);

  const handleSelectChip = useCallback((act: string) => {
    setSelectedActivities((prev) => {
      if (prev.includes(act)) {
        return prev.filter((a) => a !== act);
      }
      return [act];
    });
  }, []);

  const toggleArea = useCallback((ar: string) => {
    setSelectedAreas((prev) =>
      prev.includes(ar) ? prev.filter((a) => a !== ar) : [...prev, ar]
    );
  }, []);

  const { currentList, dayCounts, allCount } = useMemo(() => {
    return filterAndCountEvents(
      indexedEvents,
      activeDayIdx,
      maxPrice,
      priceConfig,
      selectedTimes,
      selectedActivities,
      selectedAreas,
      deferredSearchQuery,
      TIME_GROUPS
    );
  }, [
    indexedEvents,
    activeDayIdx,
    maxPrice,
    priceConfig,
    selectedTimes,
    selectedActivities,
    selectedAreas,
    deferredSearchQuery,
  ]);

  const allEventGroups = useMemo(() => {
    if (!isAllEventsTab) return [];
    return groupEventsForDirectory(currentList);
  }, [isAllEventsTab, currentList]);

  const nextUpEventId = useMemo(() => {
    if (!mounted || activeDayIdx !== 0) return null;
    const now = new Date();
    const nowHour = now.getHours() + now.getMinutes() / 60;
    const nextEvent = currentList.find((ev) => ev.parsedHour >= nowHour);
    if (!nextEvent) return null;
    const idx = indexedEvents.indexOf(nextEvent);
    const sourceEvent = idx >= 0 ? allEvents[idx] : nextEvent;
    return eventKeyMap.get(sourceEvent) || getEventSlug(nextEvent);
  }, [mounted, activeDayIdx, allEvents, currentList, eventKeyMap, indexedEvents]);

  const handleToggleEvent = useCallback(
    (ev: Event, uniqueId: string) => {
      const baseSlug = getEventSlug(ev);
      if (openEventId === uniqueId || openEventId === baseSlug) {
        setOpenEventId(null);
        syncEventHash(null);
      } else {
        setOpenEventId(uniqueId);
        syncEventHash(baseSlug);
      }
    },
    [openEventId, syncEventHash]
  );

  const handleSelectDay = useCallback(
    (idx: number) => {
      setActiveDayIdx(idx);
      setOpenEventId(null);
      syncEventHash(null);
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (idx === ALL_EVENTS_IDX) {
          url.searchParams.set('tab', 'all');
        } else {
          url.searchParams.delete('tab');
        }
        window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      }
    },
    [syncEventHash]
  );

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    maxPrice < priceConfig.maxPrice ||
    selectedTimes.length > 0 ||
    selectedActivities.length > 0 ||
    selectedAreas.length > 0;

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedMaxPrice(null);
    setSelectedTimes([]);
    setSelectedActivities([]);
    setSelectedAreas([]);
  }, []);

  const totalEventsCount = allEvents.length;
  const dayHeading = isAllEventsTab
    ? 'All Events'
    : activeDayIdx === 0
    ? 'Today'
    : activeDayIdx === 1
    ? 'Tomorrow'
    : DAY_NAMES_LONG[activeDate.getDay()];
  const daySubheading = isAllEventsTab
    ? `All ${city.name} events & activities`
    : `${DAY_NAMES_LONG[activeDate.getDay()]}, ${activeDate.getDate()} ${
        MONTH_NAMES[activeDate.getMonth()]
      }`;

  return (
    <div className={styles.pageContainer}>
      <Header city={city} />
      {city.alertBanner && (
        <div className={styles.alertBanner} role="status">
          <div className={styles.alertBannerInner}>
            <span className={styles.alertBannerIcon} aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </span>
            <span className={styles.alertBannerText}>
              {city.alertBanner.message}
              {city.alertBanner.linkText && city.alertBanner.linkHref ? (
                <>
                  {' '}
                  <Link href={city.alertBanner.linkHref} className={styles.alertBannerLink}>
                    {city.alertBanner.linkText}
                  </Link>
                </>
              ) : null}
            </span>
          </div>
        </div>
      )}
      <div className={styles.heroWrapper}>
        <CityHeroCard
          cityName={city.name}
          introTitle={city.introTitle}
          introDescription={city.introDescription}
          eventCount={totalEventsCount}
          lastUpdated={lastUpdated}
          activities={activities}
          selectedActivities={selectedActivities}
          onSelectChip={handleSelectChip}
          onClearActivities={() => setSelectedActivities([])}
        />
      </div>
      <main className={styles.mainContent}>
        <div className={styles.mainLayout}>
          <aside className={styles.aside}>
            <h2 className={styles.asideTitle}>{dayHeading}</h2>
            <p className={styles.asideSubtitle}>{daySubheading}</p>
            <DayPicker
              rollingWeek={rollingWeek}
              activeDayIdx={activeDayIdx}
              onSelectDay={handleSelectDay}
              dayCounts={dayCounts}
              allEventsCount={allCount}
              citySlug={city.slug}
            />
            <FilterControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              priceConfig={priceConfig}
              maxPrice={maxPrice}
              onPriceChange={handlePriceChange}
              timeSections={TIME_GROUPS.map((g) => g.name)}
              selectedTimes={selectedTimes}
              onToggleTime={toggleTime}
              onClearTimes={() => setSelectedTimes([])}
              activities={activities}
              selectedActivities={selectedActivities}
              onToggleActivity={toggleActivity}
              onClearActivities={() => setSelectedActivities([])}
              areas={areas}
              selectedAreas={selectedAreas}
              onToggleArea={toggleArea}
              onClearAreas={() => setSelectedAreas([])}
              hasActiveFilters={hasActiveFilters}
              onClearAllFilters={clearAllFilters}
            />
          </aside>
          <section className={styles.contentCol}>
            {currentList.length === 0 ? (
              <div className={styles.emptyState}>
                <b className={styles.emptyStateTitle}>
                  Nothing listed{hasActiveFilters ? ' with these filters' : ''}
                </b>
                {hasActiveFilters ? (
                  'Try clearing your filters to see more events.'
                ) : (
                  <>
                    Know an event or group happening in {city.name}?{' '}
                    <Link
                      href={`/${city.slug}/contact?tab=submit`}
                      className={styles.emptyStateLink}
                    >
                      Submit an event
                    </Link>
                    .
                  </>
                )}
              </div>
            ) : isAllEventsTab ? (
              allEventGroups.map((group) => {
                if (group.events.length === 0) return null;
                return (
                  <div key={group.key}>
                    <div className={styles.timeGroupHeader}>
                      {group.label} ({group.events.length})
                      <div className={styles.timeGroupLine} />
                    </div>
                    {group.events.map((ev) => {
                      const foundIdx = indexedEvents.findIndex(
                        (ie) => ie.id === ev.id && ie.title === ev.title
                      );
                      const sourceEvent = foundIdx >= 0 ? allEvents[foundIdx] : ev;
                      const baseKey =
                        eventKeyMap.get(sourceEvent) || getEventSlug(ev);
                      const uniqueId = `${group.key}-${baseKey}`;
                      return (
                        <EventCard
                          key={uniqueId}
                          domId={`event-card-${uniqueId}`}
                          event={sourceEvent}
                          isOpen={openEventId === uniqueId || openEventId === baseKey}
                          isNextUp={false}
                          city={city}
                          selectedDate={null}
                          onToggle={() => handleToggleEvent(sourceEvent, uniqueId)}
                          onOpenEdit={setEditModalEvent}
                        />
                      );
                    })}
                  </div>
                );
              })
            ) : (
              TIME_GROUPS.map((group) => {
                const groupEvents = currentList.filter((ev) =>
                  group.predicate(ev.parsedHour)
                );
                if (groupEvents.length === 0) return null;
                return (
                  <div key={group.name}>
                    <div className={styles.timeGroupHeader}>
                      {group.name}
                      <div className={styles.timeGroupLine} />
                    </div>
                    {groupEvents.map((ev) => {
                      const idx = indexedEvents.indexOf(ev);
                      const sourceEvent = idx >= 0 ? allEvents[idx] : ev;
                      const uniqueId =
                        eventKeyMap.get(sourceEvent) || getEventSlug(ev);
                      const isDateRec = isDateRecurringEvent(sourceEvent);
                      return (
                        <EventCard
                          key={uniqueId}
                          domId={`event-card-${uniqueId}`}
                          event={sourceEvent}
                          isOpen={openEventId === uniqueId}
                          isNextUp={uniqueId === nextUpEventId}
                          city={city}
                          selectedDate={isDateRec ? null : activeDate}
                          onToggle={() => handleToggleEvent(sourceEvent, uniqueId)}
                          onOpenEdit={setEditModalEvent}
                        />
                      );
                    })}
                  </div>
                );
              })
            )}
          </section>
        </div>
      </main>
      <Footer city={city} />
      {editModalEvent && (
        <SuggestEditModal
          event={editModalEvent}
          cityName={city.name}
          onClose={() => setEditModalEvent(null)}
        />
      )}
    </div>
  );
}