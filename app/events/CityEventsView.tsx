'use client';

import { useState, useEffect, useMemo } from 'react';
import { CityConfig, CITIES } from '../lib/cities';
import { getEvents, Event } from '../lib/google-sheets';
import { parseHour, isFreePrice, isEventActiveOnDate } from './utils';
import EventHeader from './components/EventHeader';
import DayPicker from './components/DayPicker';
import FilterControls from './components/FilterControls';
import EventCard from './components/EventCard';
import SuggestEditModal from './components/SuggestEditModal';
import EventFooter from './components/EventFooter';
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
  const [allEvents, setAllEvents] = useState<Event[]>(initialEvents);
  const [cityCounts, setCityCounts] = useState<Record<string, number>>(initialCityCounts);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [editModalEvent, setEditModalEvent] = useState<Event | null>(null);

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

  const activeDate = rollingWeek[activeDayIdx] || rollingWeek[0];
  const now = new Date();
  const nowHour = now.getHours() + now.getMinutes() / 60;

  const activities = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => {
      const list =
        ev.activities && ev.activities.length > 0
          ? ev.activities
          : ev.activity
          ? ev.activity.split(',').map((a) => a.trim()).filter(Boolean)
          : [ev.activity1, ev.activity2, ev.activity3].filter(Boolean);
      list.forEach((act) => {
        const trimmed = act.trim();
        if (trimmed) set.add(trimmed);
      });
    });
    return Array.from(set).filter(Boolean).sort();
  }, [allEvents]);

  const areas = useMemo(() => {
    const set = new Set<string>();
    allEvents.forEach((ev) => {
      if (ev.area && ev.area.trim().length > 0 && ev.area.trim().length < 35) {
        set.add(ev.area.trim());
      }
    });
    return Array.from(set).sort();
  }, [allEvents]);

  const toggleTime = (tName: string) => {
    setSelectedTimes((prev) =>
      prev.includes(tName) ? prev.filter((t) => t !== tName) : [...prev, tName]
    );
  };

  const toggleActivity = (act: string) => {
    setSelectedActivities((prev) =>
      prev.includes(act) ? prev.filter((a) => a !== act) : [...prev, act]
    );
  };

  const toggleArea = (ar: string) => {
    setSelectedAreas((prev) =>
      prev.includes(ar) ? prev.filter((a) => a !== ar) : [...prev, ar]
    );
  };

  const getFilteredEventsForDay = (dayIndex: number) => {
    const day = rollingWeek[dayIndex];
    if (!day) return [];
    return allEvents
      .filter((ev) => {
        if (!isEventActiveOnDate(ev, day)) return false;
        if (freeOnly && !isFreePrice(ev.price)) return false;

        const evHour = parseHour(ev.startTime);
        if (selectedTimes.length > 0) {
          const matchesTime = selectedTimes.some((tgName) => {
            const group = TIME_GROUPS.find((g) => g.name === tgName);
            return group ? group.predicate(evHour) : false;
          });
          if (!matchesTime) return false;
        }

        if (selectedActivities.length > 0) {
          const acts = (
            ev.activities && ev.activities.length > 0
              ? ev.activities
              : ev.activity
              ? ev.activity.split(',').map((a) => a.trim())
              : [ev.activity1, ev.activity2, ev.activity3]
          )
            .filter(Boolean)
            .map((a) => a.trim().toLowerCase());
          const hasActivityMatch = selectedActivities.some((sa) =>
            acts.includes(sa.toLowerCase())
          );
          if (!hasActivityMatch) return false;
        }

        if (selectedAreas.length > 0) {
          const areaLower = (ev.area || '').trim().toLowerCase();
          const hasAreaMatch = selectedAreas.some(
            (sa) => sa.toLowerCase() === areaLower
          );
          if (!hasAreaMatch) return false;
        }

        if (searchQuery.trim()) {
          const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
          const searchableText = [
            ev.title,
            ev.venue,
            ev.organization,
            ev.location,
            ev.area,
            ev.activity,
            ...(ev.activities || []),
            ev.about,
            ev.notes,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          const matchesSearch = queryTerms.every((term) => searchableText.includes(term));
          if (!matchesSearch) return false;
        }

        return true;
      })
      .sort((a, b) => parseHour(a.startTime) - parseHour(b.startTime));
  };

  const currentList = useMemo(() => {
    return getFilteredEventsForDay(activeDayIdx);
  }, [allEvents, activeDayIdx, freeOnly, selectedTimes, selectedActivities, selectedAreas, searchQuery, rollingWeek]);

  const nextUpEventId = useMemo(() => {
    if (activeDayIdx !== 0) return null;
    const nextEvent = currentList.find((ev) => parseHour(ev.startTime) >= nowHour);
    return nextEvent ? nextEvent.id || nextEvent.title : null;
  }, [activeDayIdx, currentList, nowHour]);

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    freeOnly ||
    selectedTimes.length > 0 ||
    selectedActivities.length > 0 ||
    selectedAreas.length > 0;

  const clearAllFilters = () => {
    setSearchQuery('');
    setFreeOnly(false);
    setSelectedTimes([]);
    setSelectedActivities([]);
    setSelectedAreas([]);
  };

  const allCityOptions = useMemo(() => {
    return Object.values(CITIES).filter(
      (c, index, arr) => arr.findIndex((x) => x.slug === c.slug) === index
    );
  }, []);

  return (
    <div className={styles.pageContainer}>
      <EventHeader
        city={city}
        allCityOptions={allCityOptions}
        cityCounts={cityCounts}
      />
      <main className={styles.mainLayout}>
        <aside className={styles.aside}>
          <h1 className={styles.asideTitle}>
            {activeDayIdx === 0
              ? 'Today'
              : activeDayIdx === 1
              ? 'Tomorrow'
              : DAY_NAMES_LONG[activeDate.getDay()]}
          </h1>
          <p className={styles.asideSubtitle}>
            {DAY_NAMES_LONG[activeDate.getDay()]}, {activeDate.getDate()}{' '}
            {MONTH_NAMES[activeDate.getMonth()]} · {currentList.length}{' '}
            {currentList.length === 1 ? 'thing' : 'things'} on
          </p>
          <DayPicker
            rollingWeek={rollingWeek}
            activeDayIdx={activeDayIdx}
            onSelectDay={(idx) => {
              setActiveDayIdx(idx);
              setOpenEventId(null);
            }}
            getEventCountForDay={(idx) => getFilteredEventsForDay(idx).length}
          />
          <FilterControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            freeOnly={freeOnly}
            onToggleFree={() => setFreeOnly(!freeOnly)}
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
          <div className={styles.mobileSectionHeader}>
            <h1 className={styles.mobileHeadingTitle}>
              {activeDayIdx === 0
                ? 'Today'
                : activeDayIdx === 1
                ? 'Tomorrow'
                : DAY_NAMES_LONG[activeDate.getDay()]}
            </h1>
            <p className={styles.mobileHeadingSubtitle}>
              {DAY_NAMES_LONG[activeDate.getDay()]}, {activeDate.getDate()}{' '}
              {MONTH_NAMES[activeDate.getMonth()]} · {currentList.length}{' '}
              {currentList.length === 1 ? 'thing' : 'things'} on
            </p>
          </div>
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
                group.predicate(parseHour(ev.startTime))
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
      <EventFooter />
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