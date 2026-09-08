'use client';

import NewsletterSignupForm from './NewsletterSignupForm';
import TrustBadgesRow from './TrustBadgesRow';

export default function NewsletterSection() {
  return (
    <section className="section-gradient bg-[#050606]">
      {/* ── Newsletter ────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <NewsletterSignupForm />

          {/* Columna derecha — imagen decorativa */}
          <div className="hidden md:flex items-center justify-end">
            <div className="w-full max-w-sm h-64 rounded-2xl bg-gradient-to-br from-[#0C0C0C] to-[#050606] border border-[#0D0F0F] flex items-center justify-center overflow-hidden">
              <div className="text-center opacity-20">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="55" cy="42" rx="30" ry="35" fill="#2a2a2a" stroke="#B7D31A" strokeWidth="3"/>
                  <circle cx="45" cy="32" r="4" fill="#B7D31A" opacity="0.8"/>
                  <circle cx="60" cy="28" r="4" fill="#B7D31A" opacity="0.8"/>
                  <circle cx="68" cy="38" r="4" fill="#B7D31A" opacity="0.8"/>
                  <circle cx="48" cy="46" r="4" fill="#B7D31A" opacity="0.6"/>
                  <circle cx="63" cy="50" r="4" fill="#B7D31A" opacity="0.6"/>
                  <rect x="48" y="74" width="14" height="34" rx="7" fill="#B7D31A" opacity="0.9"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Trust badges ─────────────────────────────────────────────────── */}
      <TrustBadgesRow />
    </section>
  );
}
