'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const DEFAULT_HERO = { chip: 'ESTAMOS PARA AYUDARTE', title: 'Contactanos', description: 'Tenes dudas sobre nuestros productos, envíos o pagos? Nuestro equipo esta para ayudarte.' };

export function useContactoPageData() {
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [heroImage, setHeroImage] = useState('');
  const [infoCards, setInfoCards] = useState<any[]>([]);
  const [benefits, setBenefits] = useState([]);
  const [channels, setChannels] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [mapUrl, setMapUrl] = useState('');
  const [newsletterTitle, setNewsletterTitle] = useState('ENTERATE DE LAS NOVEDADES');
  const [newsletterText, setNewsletterText] = useState('Suscribite y recibi ofertas exclusivas y lanzamientos.');
  const [sections, setSections] = useState({
    heroActive: true,
    benefitsActive: true,
    channelsActive: true,
    faqActive: true,
    mapActive: true,
    newsletterActive: true,
  });

  useEffect(() => {
    fetch(API_URL + '/benefits').then(r => r.json()).then(d => setBenefits(Array.isArray(d) ? d : d?.data || [])).catch(() => {});
    fetch(API_URL + '/faq').then(r => r.json()).then(d => setFaqs((Array.isArray(d) ? d : d?.data || []).slice(0, 4))).catch(() => {});
    fetch(API_URL + '/contact-channels').then(r => r.json()).then(d => setChannels(Array.isArray(d) ? d : d?.data || [])).catch(() => {});
    fetch(API_URL + '/site-sections/contacto')
      .then((r) => r.json())
      .then((d) => {
        const data = d?.data || d;
        if (data?.chip) setHero((prev) => ({ chip: data.chip, title: data.title || prev.title, description: data.description || prev.description }));
        if (data?.heroImage) setHeroImage(data.heroImage);
        if (data?.cards) setInfoCards(data.cards);
        if (data?.mapUrl) setMapUrl(data.mapUrl);
        if (data?.newsletterTitle) setNewsletterTitle(data.newsletterTitle);
        if (data?.newsletterText) setNewsletterText(data.newsletterText);
        setSections({
          heroActive: data?.heroActive !== false,
          benefitsActive: data?.benefitsActive !== false,
          channelsActive: data?.channelsActive !== false,
          faqActive: data?.faqActive !== false,
          mapActive: data?.mapActive !== false,
          newsletterActive: data?.newsletterActive !== false,
        });
      })
      .catch(() => {});
  }, []);

  return { hero, heroImage, infoCards, benefits, channels, faqs, mapUrl, newsletterTitle, newsletterText, sections };
}
