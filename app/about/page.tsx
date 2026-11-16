import type { Metadata } from 'next';
import { SITE_URL } from '../lib/cities';
import AboutView from '../components/AboutView';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about Someplace Social, our mission to build in-person community, and our event listing criteria. 100% free and ad-free.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About | Someplace Social',
    description:
      'Learn about Someplace Social, our mission to build in-person community, and our event listing criteria. 100% free and ad-free.',
    url: '/about',
    siteName: 'Someplace Social',
    locale: 'en_US',
    type: 'website',
  },
};

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Someplace Social',
    url: `${SITE_URL}/about`,
    description:
      'Learn about Someplace Social, our mission to build in-person community, and our event listing criteria. 100% free and ad-free.',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Someplace Social',
      url: SITE_URL,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <AboutView />
    </>
  );
}