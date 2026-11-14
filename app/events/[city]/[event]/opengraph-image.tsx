import { ImageResponse } from 'next/og';
import { getCityBySlug } from '../../../lib/cities';
import { getEvents } from '../../../lib/google-sheets';
import { isFreePrice } from '../../utils';
import { buildScheduleLine, resolveEventBySlug } from '../../event-helpers';
export const revalidate = 3600;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';
export const alt = 'Someplace Social Event Listing';
function truncateText(text: string, maxLen: number): string {
  const cleaned = text.trim();
  if (cleaned.length <= maxLen) return cleaned;
  return `${cleaned.slice(0, maxLen - 1).trimEnd()}…`;
}
export default async function EventOpenGraphImage({
  params,
}: {
  params: Promise<{ city: string; event: string }>;
}) {
  const { city: citySlug, event: eventSlug } = await params;
  const city = getCityBySlug(citySlug);
  const events = city ? await getEvents(city, 3600) : [];
  const resolved = city ? resolveEventBySlug(events, eventSlug) : null;
  if (!city || !resolved) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '72px',
            backgroundColor: '#fff9ec',
            color: '#1f1b16',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: '#1f7a4d',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Someplace Social
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
            Community Events &amp; Gatherings
          </div>
        </div>
      ),
      { ...size }
    );
  }
  const { event } = resolved;
  const titleText = truncateText(event.title, 78);
  const scheduleLine = truncateText(buildScheduleLine(event), 48);
  const venueName = (event.venue || event.location || '').trim();
  const areaName = (event.area || '').trim();
  const placeLine = truncateText(
    venueName && areaName && venueName.toLowerCase() !== areaName.toLowerCase()
      ? `${venueName} · ${areaName}`
      : venueName || areaName || city.heroLocation,
    50
  );
  const priceText = (event.price || '').trim();
  const freeHighlight = Boolean(priceText && isFreePrice(priceText));
  const eyebrowText = areaName
    ? `Someplace Social · ${city.name} · ${areaName}`
    : `Someplace Social · ${city.name}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 68px',
          backgroundColor: '#fff9ec',
          color: '#1f1b16',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff',
            border: '2px solid #eadfc8',
            borderRadius: '28px',
            padding: '52px 56px',
            flex: 1,
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#1f7a4d',
                marginBottom: 24,
              }}
            >
              {eyebrowText}
            </div>
            <div
              style={{
                fontSize: titleText.length > 48 ? 52 : 62,
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#1f1b16',
              }}
            >
              {titleText}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '14px',
              alignItems: 'center',
            }}
          >
            {scheduleLine && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#f3ead4',
                  border: '1.5px solid #d6c8ad',
                  borderRadius: '14px',
                  padding: '12px 22px',
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1f1b16',
                }}
              >
                {scheduleLine}
              </div>
            )}
            {placeLine && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#faf4e6',
                  border: '1.5px solid #eadfc8',
                  borderRadius: '14px',
                  padding: '12px 22px',
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#4f483e',
                }}
              >
                {placeLine}
              </div>
            )}
            {priceText && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: freeHighlight ? '#e4f4ea' : '#f3ead4',
                  border: freeHighlight ? '1.5px solid #1f7a4d' : '1.5px solid #d6c8ad',
                  borderRadius: '14px',
                  padding: '12px 22px',
                  fontSize: 24,
                  fontWeight: 800,
                  color: freeHighlight ? '#1f7a4d' : '#1f1b16',
                }}
              >
                {priceText}
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '22px',
            paddingLeft: '8px',
            paddingRight: '8px',
            fontSize: 20,
            fontWeight: 600,
            color: '#6f675c',
          }}
        >
          <span>someplacesocial.org</span>
          <span>Weekly community events · Free &amp; ad-free</span>
        </div>
      </div>
    ),
    { ...size }
  );
}