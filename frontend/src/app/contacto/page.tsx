'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Clock, MapPin } from 'lucide-react';
import BenefitsStrip from '@/components/home/BenefitsStrip';
import ContactForm from '@/components/contacto/ContactForm';
import ContactChannelsSection from '@/components/contacto/ContactChannelsSection';
import FaqSection from '@/components/contacto/FaqSection';
import MapSection from '@/components/contacto/MapSection';
import NewsletterSection from '@/components/contacto/NewsletterSection';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:4000';

function getFullUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return API_BASE + path;
}

const ICON_MAP: Record<string, any> = { MessageCircle, Mail, Clock, MapPin };

export default function ContactoPage() {
  const [hero, setHero] = useState({ chip: 'ESTAMOS PARA AYUDARTE', title: 'Contactanos', description: 'Tenes dudas sobre nuestros productos, envios o pagos? Nuestro equipo esta para ayudarte.' });
  const [heroImage, setHeroImage] = useState('');
  const [infoCards, setInfoCards] = useState<any[]>([]);
  const [benefits, setBenefits] = useState([]);
  const [channels, setChannels] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [mapUrl, setMapUrl] = useState('');
  const [newsletterTitle, setNewsletterTitle] = useState('ENTERATE DE LAS NOVEDADES');
  const [newsletterText, setNewsletterText] = useState('Suscribite y recibi ofertas exclusivas y lanzamientos.');

  useEffect(() => {
    fetch(API_URL + '/benefits').then(r => r.json()).then(d => setBenefits(Array.isArray(d) ? d : d?.data || [])).catch(() => {});
    fetch(API_URL + '/faq').then(r => r.json()).then(d => setFaqs((Array.isArray(d) ? d : d?.data || []).slice(0, 4))).catch(() => {});
    fetch(API_URL + '/contact-channels').then(r => r.json()).then(d => setChannels(Array.isArray(d) ? d : d?.data || [])).catch(() => {});
    fetch(API_URL + '/site-sections/contacto')
      .then((r) => r.json())
      .then((d) => {
        const data = d?.data || d;
        if (data?.chip) setHero({ chip: data.chip, title: data.title || hero.title, description: data.description || hero.description });
        if (data?.heroImage) setHeroImage(data.heroImage);
        if (data?.cards) setInfoCards(data.cards);
        if (data?.mapUrl) setMapUrl(data.mapUrl);
        if (data?.newsletterTitle) setNewsletterTitle(data.newsletterTitle);
        if (data?.newsletterText) setNewsletterText(data.newsletterText);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-[#F7F6F7]">
      {/* HERO SECTION con imagen de fondo */}
      <section className="relative overflow-hidden bg-[#0C0C0C]">
        {heroImage && (
          <>
            <img src={getFullUrl(heroImage)} alt="" className="absolute right-0 top-0 h-full w-[55%] object-cover opacity-25" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0C0C0C] via-[#0C0C0C]/70 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0C0C0C]/60 via-transparent to-[#0C0C0C] pointer-events-none" />
          </>
        )}

        <div className="relative z-10 border-b border-[#0D0F0F]/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-2.5 flex items-center gap-1.5 text-[11px] text-[#8A8A85]">
            <Link href="/" className="hover:text-[#F7F6F7] transition-colors">Inicio</Link><span>/</span>
            <span className="text-[#F7F6F7]">Contacto</span>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <p className="text-[#B7D31A] text-xs font-semibold uppercase tracking-[0.2em] mb-3">{hero.chip}</p>
              <h1 className="text-4xl md:text-5xl font-semibold text-[#F7F6F7] leading-tight mb-4">{hero.title}</h1>
              <p className="text-[#C7C7C0] text-base leading-relaxed mb-8">{hero.description}</p>
              <div className="space-y-5">
                {infoCards.map((item: any, i: number) => {
                  const IconComp = ICON_MAP[item.icon] || MessageCircle;
                  return item.href ? (
                    <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                      <div className={'w-11 h-11 rounded-xl border flex items-center justify-center flex-none group-hover:scale-105 transition-transform ' + item.bg}>
                        <IconComp size={20} className={item.icon === 'MessageCircle' ? 'text-green-400' : item.icon === 'Mail' ? 'text-[#B7D31A]' : 'text-[#8A8A85]'} />
                      </div>
                      <div><p className="text-[#F7F6F7] font-semibold text-sm">{item.title}</p><p className="text-[#C7C7C0] text-xs mt-0.5">{item.desc}</p><p className="text-[#B7D31A] font-semibold text-sm mt-0.5">{item.detail}</p></div>
                    </a>
                  ) : (
                    <div key={i} className="flex items-start gap-4">
                      <div className={'w-11 h-11 rounded-xl border flex items-center justify-center flex-none ' + item.bg}><IconComp size={20} className="text-[#8A8A85]" /></div>
                      <div><p className="text-[#F7F6F7] font-semibold text-sm">{item.title}</p><p className="text-[#C7C7C0] text-xs mt-0.5">{item.desc}</p><p className="text-[#C7C7C0] text-xs">{item.detail}</p></div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-[#1A1F21] border border-[#0D0F0F] rounded-2xl p-6 md:p-8">
              <h2 className="text-lg font-semibold text-[#F7F6F7] mb-6">Envianos tu mensaje</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      <BenefitsStrip benefits={benefits} />
      <ContactChannelsSection channels={channels} />
      <FaqSection faqs={faqs} />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#B7D31A]/25 to-transparent" />
      </div>

      <MapSection mapUrl={mapUrl} />
      <NewsletterSection title={newsletterTitle} text={newsletterText} />
    </div>
  );
}