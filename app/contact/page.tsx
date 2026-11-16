import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactView from './ContactView';

const title = 'Contact Us';
const description = 'Submit a new regularly occurring event or ask us a question.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: `${title} | Someplace Social`,
    description,
    url: '/contact',
    siteName: 'Someplace Social',
    locale: 'en_US',
    type: 'website',
  },
};

export default function ContactPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <Suspense fallback={null}>
        <ContactView />
      </Suspense>
      <Footer />
    </div>
  );
}