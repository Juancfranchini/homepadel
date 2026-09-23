'use client';

import { Suspense } from 'react';
import CheckoutOutcome from '../CheckoutOutcome';

export default function PendingPage() {
  return (
    <Suspense>
      <CheckoutOutcome porDefecto="pendiente" />
    </Suspense>
  );
}
