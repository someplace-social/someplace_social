import type { Metadata } from 'next';
import AboutView from './components/AboutView';
export const metadata: Metadata = {
  title: 'Community Events, Social Clubs & Weekly Activities',
  description:
    'Find weekly community events, social clubs, classes, and meetups in Medellín, Fort Collins, and beyond. Free and accessible to everyone.',
};
export default function Home() {
  return <AboutView />;
}