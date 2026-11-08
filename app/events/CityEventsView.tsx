'use client';
import { useState, useEffect, useMemo, useDeferredValue, useCallback } from 'react';
import { CityConfig, getAllCities, getCityPriceConfig } from '../lib/cities';
import { getEvents, Event } from '../lib/google-sheets';
import {
  parseHour,
  indexEvents,
  filterAndCountEvents,
  IndexedEvent,
} from './utils';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DayPicker from './components/DayPicker';
import FilterControls from './components/FilterControls';
import EventCard from './components/EventCard';
import SuggestEditModal from './components/SuggestEditModal';
import CityHeroCard from './components/CityHeroCard';
import styles from './EventsView.module.css';

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

export default function CityEventsView({
  city,
  initialEvents = [],
  initialCityCounts = {},
}: {
  city: CityConfig;
  initialEvents?: Event[];
  initialCityCounts?: Record<string, number>;
}) {
  const priceConfig = useMemo(() => getCityPriceConfig(city), [city]);
  const [allEvents, setAllEvents] = useState<Event[]>(initialEvents);
  const [cityCounts, setCityCounts] = useState<Record<string, number>>(initialCityCounts);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [maxPrice, setMaxPrice] = useState<number>(priceConfig.maxPrice);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [editModalEvent, setEditModalEvent] = useState<Event | null>(null);

  useEffect(() => {
    setMaxPrice(priceConfig.maxPrice);
  }, [priceConfig]);

  useEffect(() => {
    if (initialEvents.length === 0) {
      setLoading(true);
      getEvents(city)
        .then((data) => {
          setAllEvents(data);
          setCityCounts((prev) => ({ ...prev, [city.slug]: data.length }));
        })
        .finally(() => setLoading(false));
    } else {
      setAllEvents(initialEvents);
      setCityCounts((prev) => ({ ...prev, [city.slug]: initialEvents.length }));
      setLoading(false);
    }
  }, [city, initialEvents]);

  const rollingWeek = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const indexedEvents = useMemo(() => {
    return indexEvents(allEvents, rollingWeek, priceConfig.currencyCode);
  }, [allEvents, rollingWeek, priceConfig.currencyCode]);

  const activeDate = rollingWeek[activeDayIdx] || rollingWeek[0];
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

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

  const { currentList, dayCounts } = useMemo(() => {
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

  const nextUpEventId = useMemo(() => {
    if (activeDayIdx !== 0) return null;
    const nextEvent = currentList.find((ev) => ev.parsedHour >= nowHour);
    return nextEvent ? nextEvent.id || nextEvent.title : null;
  }, [activeDayIdx, currentList, nowHour]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    maxPrice < priceConfig.maxPrice ||
    selectedTimes.length > 0 ||
    selectedActivities.length > 0 ||
    selectedAreas.length > 0;

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setMaxPrice(priceConfig.maxPrice);
    setSelectedTimes([]);
    setSelectedActivities([]);
    setSelectedAreas([]);
  }, [priceConfig.maxPrice]);

  const allCityOptions = useMemo(() => getAllCities(), []);
  const totalEventsCount = allEvents.length || cityCounts[city.slug] || initialEvents.length;

  const dayHeading =
    activeDayIdx === 0
      ? 'Today'
      : activeDayIdx === 1
      ? 'Tomorrow'
      : DAY_NAMES_LONG[activeDate.getDay()];

  const daySubheading = `${DAY_NAMES_LONG[activeDate.getDay()]}, ${activeDate.getDate()} ${
    MONTH_NAMES[activeDate.getMonth()]
  } · ${currentList.length} ${currentList.length === 1 ? 'thing' : 'things'} on`;

  return (
    <div className={styles.pageContainer}>
      <Header
        city={city}
        allCityOptions={allCityOptions}
        cityCounts={cityCounts}
      />
      <div className={styles.heroWrapper}>
        <CityHeroCard
          cityName={city.name}
          introTitle={city.introTitle}
          introDescription={city.introDescription}
          eventCount={totalEventsCount}
          activities={activities}
          selectedActivities={selectedActivities}
          onSelectChip={handleSelectChip}
          onClearActivities={() => setSelectedActivities([])}
        />
      </div>
      <main className={styles.mainLayout}>
        <aside className={styles.aside}>
          <h2 className={styles.asideTitle}>{dayHeading}</h2>
          <p className={styles.asideSubtitle}>{daySubheading}</p>
          <DayPicker
            rollingWeek={rollingWeek}
            activeDayIdx={activeDayIdx}
            onSelectDay={(idx) => {
              setActiveDayIdx(idx);
              setOpenEventId(null);
            }}
            dayCounts={dayCounts}
          />
          <FilterControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            priceConfig={priceConfig}
            maxPrice={maxPrice}
            onPriceChange={setMaxPrice}
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
          {loading ? (
            <div className={styles.emptyState}>
              <b className={styles.emptyStateTitle}>Loading {city.name} events...</b>
              Gathering up-to-date weekly community activities.
            </div>
          ) : currentList.length === 0 ? (
            <div className={styles.emptyState}>
              <b className={styles.emptyStateTitle}>
                Nothing listed{hasActiveFilters ? ' with these filters' : ''}
              </b>
              {hasActiveFilters
                ? 'Try clearing your filters to see more events.'
                : 'Know an event or group happening on this day? Submit it above.'}
            </div>
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
                  {groupEvents.map((ev, i) => {
                    const uniqueId = ev.id || `${ev.title}-${i}`;
                    return (
                      <EventCard
                        key={uniqueId}
                        event={ev}
                        isOpen={openEventId === uniqueId}
                        isNextUp={uniqueId === nextUpEventId}
                        cityName={city.name}
                        onToggle={() =>
                          setOpenEventId(openEventId === uniqueId ? null : uniqueId)
                        }
                        onOpenEdit={setEditModalEvent}
                      />
                    );
                  })}
                </div>
              );
            })
          )}
        </section>
      </main>
      <Footer />
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