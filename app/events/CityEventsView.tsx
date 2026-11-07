'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CityConfig, CITIES } from '../lib/cities';
import { getEvents, Event } from '../lib/google-sheets';
import {
  parseHour,
  formatTimeRange,
  isFreePrice,
  matchesDay,
  ensureExternalUrl,
  getTagStyle,
} from './utils';
import styles from './EventsView.module.css';

const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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

type TimeGroup = {
  name: string;
  predicate: (hour: number) => boolean;
};

const TIME_GROUPS: TimeGroup[] = [
  { name: 'Morning', predicate: (h) => h < 12 },
  { name: 'Afternoon', predicate: (h) => h >= 12 && h < 17 },
  { name: 'Evening', predicate: (h) => h >= 17 && h < 20 },
  { name: 'Night', predicate: (h) => h >= 20 },
];

export default function CityEventsView({
  city,
  initialEvents = [],
}: {
  city: CityConfig;
  initialEvents?: Event[];
}) {
  const [allEvents, setAllEvents] = useState<Event[]>(initialEvents);
  const [loading, setLoading] = useState(initialEvents.length === 0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [freeOnly, setFreeOnly] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  const [citiesMenuOpen, setCitiesMenuOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const citiesMenuRef = useRef<HTMLDivElement>(null);

  const [editModalEvent, setEditModalEvent] = useState<Event | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editStatus, setEditStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (citiesMenuRef.current && !citiesMenuRef.current.contains(e.target as Node)) {
        setCitiesMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialEvents.length === 0) {
      setLoading(true);
      getEvents(city)
        .then((data) => setAllEvents(data))
        .finally(() => setLoading(false));
    } else {
      setAllEvents(initialEvents);
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
      if (ev.activity1) set.add(ev.activity1.trim());
      if (ev.activity2) set.add(ev.activity2.trim());
      if (ev.activity3) set.add(ev.activity3.trim());
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

  const getFilteredEventsForDay = (dayIndex: number) => {
    const day = rollingWeek[dayIndex];
    if (!day) return [];
    const dayName = DAY_NAMES_LONG[day.getDay()];
    return allEvents
      .filter((ev) => {
        const matchesCurrentDay = matchesDay(ev.dayOfWeek, dayName);
        if (!matchesCurrentDay) return false;
        if (freeOnly && !isFreePrice(ev.price)) return false;
        if (selectedActivity) {
          const acts = [ev.activity1, ev.activity2, ev.activity3].map((a) =>
            (a || '').trim().toLowerCase()
          );
          if (!acts.includes(selectedActivity.toLowerCase())) return false;
        }
        if (selectedArea && ev.area.trim() !== selectedArea.trim()) {
          return false;
        }
        return true;
      })
      .sort((a, b) => parseHour(a.startTime) - parseHour(b.startTime));
  };

  const currentList = useMemo(() => {
    return getFilteredEventsForDay(activeDayIdx);
  }, [allEvents, activeDayIdx, freeOnly, selectedActivity, selectedArea, rollingWeek]);

  const nextUpEventId = useMemo(() => {
    if (activeDayIdx !== 0) return null;
    const nextEvent = currentList.find((ev) => parseHour(ev.startTime) >= nowHour);
    return nextEvent ? nextEvent.id || nextEvent.title : null;
  }, [activeDayIdx, currentList, nowHour]);

  const hasActiveFilters = freeOnly || selectedActivity !== '' || selectedArea !== '';

  const clearFilters = () => {
    setFreeOnly(false);
    setSelectedActivity('');
    setSelectedArea('');
  };

  const handleOpenEdit = (event: Event) => {
    setEditModalEvent(event);
    setEditEmail('');
    setEditStatus(null);
    setEditMessage(
      `City: ${city.name}\nEvent: ${event.title}\nVenue: ${event.venue || event.location}\nTime: ${event.startTime} - ${event.endTime}\nLocation: ${event.location} (${event.area})\n\nRequested changes: `
    );
  };

  const handleCloseEdit = () => {
    setEditModalEvent(null);
    setEditStatus(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalEvent) return;
    setIsSubmitting(true);
    setEditStatus('Submitting update...');
    try {
      const fullMessage = `Sender Email: ${editEmail || 'Not provided'}\n\n${editMessage}`;
      const response = await fetch('/api/send-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: `Edit a Listing (${city.name})`,
          message: fullMessage,
        }),
      });
      const res = await response.json();
      if (res.success) {
        setEditStatus('Thanks! Your edit suggestion has been sent.');
        setTimeout(() => {
          handleCloseEdit();
        }, 1800);
      } else {
        setEditStatus('Failed to send. Please try again.');
      }
    } catch {
      setEditStatus('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allCityOptions = useMemo(() => {
    return Object.values(CITIES).filter(
      (c, index, arr) => arr.findIndex((x) => x.slug === c.slug) === index
    );
  }, []);

  return (
    <div className={styles.pageContainer}>
      <aside className={styles.topBar}>
        <div className={styles.topBarInner}>
          Free for everyone, no ads.
          <a
            href="https://buymeacoffee.com/someplacesocial"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.topBarLink}
          >
            Buy me a drink
          </a>
        </div>
      </aside>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandCol}>
            <Link href={`/events/${city.slug}`} className={styles.brandLogoLink}>
              <Image
                src="/images/logo.svg"
                alt="Someplace Social"
                width={190}
                height={50}
                priority
                className={styles.logoImage}
              />
            </Link>
            <div className={styles.brandSubtitle}>{city.heroLocation}</div>
          </div>

          <nav className={styles.navDesktop}>
            <div className={styles.citiesWrapper} ref={citiesMenuRef}>
              <button
                type="button"
                className={styles.citiesBtn}
                aria-expanded={citiesMenuOpen}
                onClick={() => setCitiesMenuOpen(!citiesMenuOpen)}
              >
                Cities
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {citiesMenuOpen && (
                <div className={styles.citiesDropdown}>
                  {allCityOptions.map((c) => {
                    const isActive = c.slug === city.slug;
                    return (
                      <Link
                        key={c.slug}
                        href={`/events/${c.slug}`}
                        className={`${styles.cityOption} ${
                          isActive ? styles.cityOptionActive : ''
                        }`}
                        onClick={() => setCitiesMenuOpen(false)}
                      >
                        {c.name}
                        {isActive && (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link href="/about" className={styles.navLink}>
              About
            </Link>
            <Link href="/contact" className={styles.navLink}>
              Contact
            </Link>
            <Link href="/contact" className={styles.addEventBtn}>
              + Add event
            </Link>
          </nav>

          <div className={styles.navMobileActions}>
            <Link href="/contact" className={styles.mobileAddBtn}>
              + Add
            </Link>
            <button
              type="button"
              className={styles.hamburgerBtn}
              aria-label="Open menu"
              onClick={() => setMobileDrawerOpen(true)}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileDrawerOpen && (
        <div
          className={styles.drawerBackdrop}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div
            className={styles.drawer}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.drawerHeader}>
              <div className={styles.drawerTitle}>Someplace Social</div>
              <button
                type="button"
                className={styles.drawerCloseBtn}
                aria-label="Close menu"
                onClick={() => setMobileDrawerOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles.drawerSectionTitle}>Choose City</div>
            <div className={styles.drawerCityList}>
              {allCityOptions.map((c) => {
                const isActive = c.slug === city.slug;
                return (
                  <Link
                    key={c.slug}
                    href={`/events/${c.slug}`}
                    className={`${styles.drawerCityItem} ${
                      isActive ? styles.drawerCityItemActive : ''
                    }`}
                    onClick={() => setMobileDrawerOpen(false)}
                  >
                    {c.name}
                    {isActive && <span>✓</span>}
                  </Link>
                );
              })}
            </div>

            <div className={styles.drawerSectionTitle}>Navigation</div>
            <div className={styles.drawerNavLinks}>
              <Link
                href="/about"
                className={styles.drawerNavLink}
                onClick={() => setMobileDrawerOpen(false)}
              >
                About
              </Link>
              <Link
                href="/contact"
                className={styles.drawerNavLink}
                onClick={() => setMobileDrawerOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/contact"
                className={styles.drawerNavLink}
                onClick={() => setMobileDrawerOpen(false)}
              >
                + Add event
              </Link>
            </div>

            <div className={styles.drawerFooter}>
              <a
                href="https://buymeacoffee.com/someplacesocial"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.drawerSupportBtn}
              >
                Buy me a drink
              </a>
            </div>
          </div>
        </div>
      )}

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

          <div className={styles.dayListVertical} role="group" aria-label="Day list">
            {rollingWeek.map((day, idx) => {
              const label =
                idx === 0
                  ? 'Today'
                  : `${DAY_NAMES_SHORT[day.getDay()]} ${day.getDate()}`;
              const count = getFilteredEventsForDay(idx).length;
              const isSelected = idx === activeDayIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.dayBtnVertical} ${
                    isSelected ? styles.dayBtnVerticalActive : ''
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setActiveDayIdx(idx);
                    setOpenEventId(null);
                  }}
                >
                  <span>{label}</span>
                  <span
                    className={`${styles.dayCountText} ${
                      isSelected ? styles.dayCountTextActive : ''
                    }`}
                  >
                    {count} events
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.filterBlockDesktop}>
            <div className={styles.filterTitle}>Filter</div>
            <div className={styles.filterListVertical}>
              <button
                type="button"
                className={styles.filterFreeBtn}
                aria-pressed={freeOnly}
                onClick={() => setFreeOnly(!freeOnly)}
              >
                Free only
                <span
                  className={`${styles.checkboxSquare} ${
                    freeOnly ? styles.checkboxChecked : ''
                  }`}
                >
                  {freeOnly && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              </button>

              <div className={styles.selectChipWrapper}>
                <select
                  className={`${styles.selectChip} ${
                    selectedActivity ? styles.selectChipActive : ''
                  }`}
                  aria-label="Filter activity"
                  value={selectedActivity}
                  onChange={(e) => setSelectedActivity(e.target.value)}
                >
                  <option value="">All activities</option>
                  {activities.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
                <svg
                  className={styles.selectArrow}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              <div className={styles.selectChipWrapper}>
                <select
                  className={`${styles.selectChip} ${
                    selectedArea ? styles.selectChipActive : ''
                  }`}
                  aria-label="Filter area"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                >
                  <option value="">All areas</option>
                  {areas.map((ar) => (
                    <option key={ar} value={ar}>
                      {ar}
                    </option>
                  ))}
                </select>
                <svg
                  className={styles.selectArrow}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  className={styles.clearFiltersBtn}
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        </aside>

        <section className={styles.contentCol}>
          <div className={styles.mobileDaysGrid} role="group" aria-label="Pick day">
            {rollingWeek.map((day, idx) => {
              const dayShort = idx === 0 ? 'Today' : DAY_NAMES_SHORT[day.getDay()];
              const count = getFilteredEventsForDay(idx).length;
              const isSelected = idx === activeDayIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.mobileDayBtn} ${
                    isSelected ? styles.mobileDayBtnActive : ''
                  }`}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setActiveDayIdx(idx);
                    setOpenEventId(null);
                  }}
                >
                  <span
                    className={`${styles.mobileDayLabel} ${
                      isSelected ? styles.mobileDayLabelActive : ''
                    }`}
                  >
                    {dayShort}
                  </span>
                  <span className={styles.mobileDayNum}>{day.getDate()}</span>
                  <span
                    className={`${styles.mobileDayCount} ${
                      isSelected ? styles.mobileDayCountActive : ''
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={styles.mobileFiltersRow}>
            <button
              type="button"
              className={`${styles.mobileFreeBtn} ${
                freeOnly ? styles.mobileFreeBtnActive : ''
              }`}
              onClick={() => setFreeOnly(!freeOnly)}
            >
              Free only
            </button>

            <div className={styles.selectChipWrapper}>
              <select
                className={`${styles.selectChip} ${
                  selectedActivity ? styles.selectChipActive : ''
                }`}
                aria-label="Activity"
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
              >
                <option value="">All activities</option>
                {activities.map((act) => (
                  <option key={act} value={act}>
                    {act}
                  </option>
                ))}
              </select>
              <svg
                className={styles.selectArrow}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            <div className={styles.selectChipWrapper}>
              <select
                className={`${styles.selectChip} ${
                  selectedArea ? styles.selectChipActive : ''
                }`}
                aria-label="Area"
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
              >
                <option value="">All areas</option>
                {areas.map((ar) => (
                  <option key={ar} value={ar}>
                    {ar}
                  </option>
                ))}
              </select>
              <svg
                className={styles.selectArrow}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={clearFilters}
              >
                Clear
              </button>
            )}
          </div>

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
                    const isOpen = openEventId === uniqueId;
                    const isNextUp = uniqueId === nextUpEventId;
                    const { start, end } = formatTimeRange(ev.startTime, ev.endTime);
                    const isFree = isFreePrice(ev.price);
                    const tagList = [ev.activity1, ev.activity2, ev.activity3].filter(
                      Boolean
                    );
                    const displayVenue = ev.venue || ev.location;

                    return (
                      <div
                        className={`${styles.eventCard} ${
                          isOpen ? styles.eventCardOpen : ''
                        }`}
                        key={uniqueId}
                      >
                        <button
                          type="button"
                          className={styles.cardRow}
                          aria-expanded={isOpen}
                          onClick={() => setOpenEventId(isOpen ? null : uniqueId)}
                        >
                          <div className={styles.timeCol}>
                            {start}
                            {end && <div className={styles.endTimeText}>to {end}</div>}
                          </div>

                          <div className={styles.infoCol}>
                            {isNextUp && (
                              <span className={styles.nextUpBadge}>Next up</span>
                            )}
                            <div className={styles.eventTitle}>
                              {ev.title}
                              {ev.organization &&
                                ev.organization !== displayVenue && (
                                  <span className={styles.eventHost}>
                                    {' '}
                                    w/ {ev.organization}
                                  </span>
                                )}
                            </div>
                            <div className={styles.eventLocation}>
                              {displayVenue}
                              {ev.area ? ` · ${ev.area}` : ''}
                            </div>

                            <div
                              className={`${styles.priceLine} ${
                                isFree ? styles.priceFree : styles.pricePaid
                              }`}
                            >
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M3 12V4h8l10 10-8 8L3 12z" />
                                <circle cx="7.5" cy="8.5" r="1" />
                              </svg>
                              {isFree ? 'Free' : ev.price || 'Varies'}
                            </div>

                            {tagList.length > 0 && (
                              <div className={styles.tagList}>
                                {tagList.map((tag) => {
                                  const customStyle = getTagStyle(tag);
                                  return (
                                    <span
                                      key={tag}
                                      className={styles.tagChip}
                                      style={{
                                        color: customStyle.color,
                                        backgroundColor: customStyle.background,
                                      }}
                                    >
                                      {tag}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <span
                            aria-hidden="true"
                            className={`${styles.chevronCircle} ${
                              isOpen ? styles.chevronCircleOpen : ''
                            }`}
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d={isOpen ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
                            </svg>
                          </span>
                        </button>

                        {isOpen && (
                          <div className={styles.expandedDrawer}>
                            {(ev.about || ev.notes) && (
                              <p className={styles.eventDescription}>
                                {ev.about || ev.notes}
                              </p>
                            )}

                            <div className={styles.drawerActionRow}>
                              <div className={styles.buttonGrid4}>
                                <a
                                  href={
                                    ev.map
                                      ? ensureExternalUrl(ev.map)
                                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                          `${displayVenue}, ${city.name}`
                                        )}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.actionBtnPrimary}
                                  aria-label="Open in Maps"
                                >
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z" />
                                    <circle cx="12" cy="10" r="2.5" />
                                  </svg>
                                  Maps
                                </a>

                                {ev.website ? (
                                  <a
                                    href={ensureExternalUrl(ev.website)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.actionBtnOutline}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="9" />
                                      <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
                                    </svg>
                                    Website
                                  </a>
                                ) : (
                                  <div
                                    className={styles.actionBtnOutline}
                                    style={{ opacity: 0.45, cursor: 'not-allowed' }}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="9" />
                                      <path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" />
                                    </svg>
                                    Website
                                  </div>
                                )}

                                {ev.social ? (
                                  <a
                                    href={ensureExternalUrl(ev.social)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.actionBtnOutline}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                                      <circle cx="12" cy="12" r="4" />
                                      <circle cx="17.2" cy="6.8" r=".6" />
                                    </svg>
                                    Instagram
                                  </a>
                                ) : (
                                  <div
                                    className={styles.actionBtnOutline}
                                    style={{ opacity: 0.45, cursor: 'not-allowed' }}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                                      <circle cx="12" cy="12" r="4" />
                                      <circle cx="17.2" cy="6.8" r=".6" />
                                    </svg>
                                    Instagram
                                  </div>
                                )}

                                {ev.contact ? (
                                  <a
                                    href={ensureExternalUrl(ev.contact)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.actionBtnOutline}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect x="3" y="5" width="18" height="14" rx="2" />
                                      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                                    </svg>
                                    Contact
                                  </a>
                                ) : (
                                  <div
                                    className={styles.actionBtnOutline}
                                    style={{ opacity: 0.45, cursor: 'not-allowed' }}
                                  >
                                    <svg
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <rect x="3" y="5" width="18" height="14" rx="2" />
                                      <path d="M3.5 6.5l8.5 6.5 8.5-6.5" />
                                    </svg>
                                    Contact
                                  </div>
                                )}
                              </div>

                              <button
                                type="button"
                                className={styles.suggestEditBtn}
                                onClick={() => handleOpenEdit(ev)}
                              >
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M4 20l1-4L16.5 4.5a2 2 0 013 3L8 19l-4 1z" />
                                </svg>
                                Suggest edit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerQuoteRow}>
            <figure className={styles.footerFigure}>
              <blockquote className={styles.footerQuoteText}>
                “What should young people do with their lives today? Many things,
                obviously. But the most daring thing is to create stable
                communities in which the terrible disease of loneliness can be
                cured.”
              </blockquote>
              <figcaption className={styles.footerAuthor}>
                – Kurt Vonnegut
              </figcaption>
            </figure>
            <a
              href="https://buymeacoffee.com/someplacesocial"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerDrinkBtn}
            >
              Buy me a drink
            </a>
          </div>
          <div className={styles.footerCopyright}>
            © 2026 Someplace Social. All rights reserved.
          </div>
        </div>
      </footer>

      {editModalEvent && (
        <div className={styles.modalBackdrop} onClick={handleCloseEdit}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <div className={styles.modalHeader}>
              <div>
                <h2 className={styles.modalTitle}>Suggest Edit</h2>
                <small className={styles.modalSubtitle}>
                  {editModalEvent.title}
                </small>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={handleCloseEdit}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className={styles.modalForm}>
              <div className={styles.modalField}>
                <label htmlFor="editEmail">Your Email (optional)</label>
                <input
                  id="editEmail"
                  type="email"
                  className={styles.modalInput}
                  placeholder="name@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              <div className={styles.modalField}>
                <label htmlFor="editMessage">What needs to be changed? *</label>
                <textarea
                  id="editMessage"
                  required
                  className={styles.modalTextarea}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={handleCloseEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={styles.modalSubmitBtn}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Edit'}
                </button>
              </div>
              {editStatus && <p className={styles.statusMsg}>{editStatus}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}