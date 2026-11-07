import { Bricolage_Grotesque } from 'next/font/google';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['500', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap',
});

export default function CityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={bricolage.variable}>{children}</div>;
}