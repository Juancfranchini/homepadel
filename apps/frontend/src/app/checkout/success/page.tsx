'use client';

import { Suspense } from 'react';
import CheckoutOutcome from '../CheckoutOutcome';

export default function SuccessPage() {
  return (
    <Suspense>
      <CheckoutOutcome porDefecto="acreditando" />
    </Suspense>
  );
}
