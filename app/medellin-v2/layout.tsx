import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Medellín v2.0 · Someplace Social',
  description: 'Medellín recurring weekly events, classes, and social activities.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MedellinV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={bricolage.variable}>{children}</div>;
}