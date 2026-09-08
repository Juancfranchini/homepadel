'use client';

import BenefitsStrip from '@/components/home/BenefitsStrip';
import ContactChannelsSection from '@/components/contacto/ContactChannelsSection';
import FaqSection from '@/components/contacto/FaqSection';
import MapSection from '@/components/contacto/MapSection';
import NewsletterSection from '@/components/contacto/NewsletterSection';
import { useContactoPageData } from './useContactoPageData';
import ContactoHero from './ContactoHero';

export default function ContactoPage() {
  const { hero, heroImage, infoCards, benefits, channels, faqs, mapUrl, newsletterTitle, newsletterText, sections } = useContactoPageData();

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F7F6F7]">
      {sections.heroActive && <ContactoHero hero={hero} heroImage={heroImage} infoCards={infoCards} />}

      {sections.benefitsActive && <BenefitsStrip benefits={benefits} />}
      {sections.channelsActive && <ContactChannelsSection channels={channels} />}
      {sections.faqActive && <FaqSection faqs={faqs} />}

      {sections.faqActive && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-[#B7D31A]/25 to-transparent" />
        </div>
      )}

      {sections.mapActive && <MapSection mapUrl={mapUrl} />}
      {sections.newsletterActive && <NewsletterSection title={newsletterTitle} text={newsletterText} />}
    </div>
  );
}
