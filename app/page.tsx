import type { Metadata } from 'next';
import AboutView from './components/AboutView';

const title = 'Community Events, Social Clubs & Weekly Activities';
const description =
  'Find weekly community events, social clubs, classes, and meetups in Medellín, Fort Collins, and beyond. Free and accessible to everyone.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: `${title} | Someplace Social`,
    description,
    url: '/',
    siteName: 'Someplace Social',
    locale: 'en_US',
    type: 'website',
  },
};

export default function Home() {
  return <AboutView />;
}