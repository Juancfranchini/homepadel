'use client';

import { Suspense } from 'react';
import CheckoutOutcome from '../CheckoutOutcome';

export default function ErrorPage() {
  return (
    <Suspense>
      <CheckoutOutcome porDefecto="rechazado" />
    </Suspense>
  );
}
