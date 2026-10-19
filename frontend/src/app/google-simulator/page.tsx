import { notFound } from 'next/navigation';
import GoogleSimulatorClient from './GoogleSimulatorClient';

export const dynamic = 'force-dynamic';

export default function GoogleSimulatorPage() {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowSimulator =
    process.env.ALLOW_GOOGLE_SIMULATOR === 'true' ||
    process.env.NEXT_PUBLIC_ALLOW_GOOGLE_SIMULATOR === 'true';

  if (isProduction || !allowSimulator) {
    notFound();
  }

  return <GoogleSimulatorClient />;
}
