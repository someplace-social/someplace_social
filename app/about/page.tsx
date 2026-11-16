import type { Metadata } from 'next';
import AboutView from '../components/AboutView';

export const metadata: Metadata = {
  title: 'About Someplace Social',
  description:
    'Learn about Someplace Social, our mission to build in-person community, and our event listing criteria. 100% free and ad-free.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Someplace Social',
    description:
      'Learn about Someplace Social, our mission to build in-person community, and our event listing criteria. 100% free and ad-free.',
    url: '/about',
    siteName: 'Someplace Social',
    locale: 'en_US',
    type: 'website',
  },
};

export default function AboutPage() {
  return <AboutView />;
}