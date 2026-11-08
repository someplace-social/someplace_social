import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactView from './ContactView';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Submit a new regularly occurring event or ask us a question.',
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