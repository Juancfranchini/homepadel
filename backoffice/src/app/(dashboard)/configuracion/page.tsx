'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Store, Shield, Bell, Mail, Target, LayoutDashboard } from 'lucide-react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import GeneralTab from './components/GeneralTab';
import SeguridadTab from './components/SeguridadTab';
import NotificacionesTab from './components/NotificacionesTab';
import EmailsTab from './components/EmailsTab';
import PlantillasTab from './components/PlantillasTab';
import CampanasTab from './components/CampanasTab';
import MetaPixelTab from './components/MetaPixelTab';
import HomeSectionsTab from './components/HomeSectionsTab';

const generalSchema = z.object({
  storeName: z.string().min(2, 'El nombre de la tienda es requerido'),
  logoUrl: z.string().optional().or(z.literal('')),
  logoFooter: z.string().optional().or(z.literal('')),
  isotipo: z.string().optional().or(z.literal('')),
  logoMobile: z.string().optional().or(z.literal('')),
  logoLogin: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email('Email invalido'),
  phone: z.string().optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
});
type GeneralForm = z.infer<typeof generalSchema>;

type Tab = 'general' | 'home_sections' | 'meta_pixel' | 'seguridad' | 'notificaciones' | 'emails';

const TABS = [
  { id: 'general' as Tab, label: 'General', icon: Store },
  { id: 'home_sections' as Tab, label: 'Secciones Home', icon: LayoutDashboard },
  { id: 'meta_pixel' as Tab, label: 'Meta Pixel', icon: Target },
  { id: 'seguridad' as Tab, label: 'Seguridad', icon: Shield },
  { id: 'notificaciones' as Tab, label: 'Notificaciones', icon: Bell },
  { id: 'emails' as Tab, label: 'Emails', icon: Mail },
];

export default function ConfiguracionPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saving, setSaving] = useState(false);
  const [savingEmailConfig, setSavingEmailConfig] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [notifs, setNotifs] = useState({ newOrder: true, shippedOrder: true, contactForm: true });
  const [emailConfig, setEmailConfig] = useState({
    resendApiKey: '',
    fromEmail: 'Home Padel <noreply@homepadel.com.ar>',
    adminEmail: 'contactohomepadel@gmail.com',
  });
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [campaignModal, setCampaignModal] = useState(false);

  const generalForm = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: {
      storeName: 'Home Padel', contactEmail: 'hola@homepadel.com',
      phone: '', address: '', whatsapp: '',
    },
  });

  useEffect(() => {
    Promise.all([
      api.get('/site-sections/settings'),
      api.get('/site-sections/branding'),
    ]).then(([settingsRes, brandingRes]) => {
      const s = settingsRes.data?.data || settingsRes.data || {};
      const b = brandingRes.data?.data || brandingRes.data || {};
      generalForm.reset({
        storeName: s.storeName || 'Home Padel',
        contactEmail: s.contactEmail || 'hola@homepadel.com',
        phone: s.phone || '',
        address: s.address || '',
        whatsapp: s.whatsapp || '',
        logoUrl: b.logoHeader || '',
        logoFooter: b.logoFooter || '',
        isotipo: b.isotipo || '',
        logoMobile: b.logoMobile || '',
      });
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeTab === 'emails') {
      loadEmailData();
    }
  }, [activeTab]);

  const loadEmailData = async () => {
    try {
      const [configRes, templatesRes, campaignsRes, recipientsRes] = await Promise.all([
        api.get('/email/config'),
        api.get('/email/templates'),
        api.get('/email/campaigns'),
        api.get('/email/recipients?source=all'),
      ]);
      if (configRes.data) {
        setEmailConfig({
          resendApiKey: configRes.data.resendApiKey || '',
          fromEmail: configRes.data.fromEmail || 'Home Padel <noreply@homepadel.com.ar>',
          adminEmail: configRes.data.adminEmail || 'contactohomepadel@gmail.com',
        });
        setNotifs({
          newOrder: configRes.data.notifications?.newOrder !== false,
          shippedOrder: configRes.data.notifications?.shippedOrder !== false,
          contactForm: configRes.data.notifications?.contactForm !== false,
        });
      }
      setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
      setCampaigns(Array.isArray(campaignsRes.data) ? campaignsRes.data : []);
      setRecipients(Array.isArray(recipientsRes.data) ? recipientsRes.data : []);
    } catch (error) {
      console.error('Error cargando datos de email:', error);
    }
  };

  const handleSaveGeneral = async (data: GeneralForm) => {
    setSaving(true);
    try {
      await Promise.all([
        api.put('/site-sections/settings', { data: { storeName: data.storeName, contactEmail: data.contactEmail, phone: data.phone, address: data.address, whatsapp: data.whatsapp } }),
        api.put('/site-sections/branding', { data: { logoHeader: data.logoUrl, logoFooter: data.logoFooter, isotipo: data.isotipo, logoMobile: data.logoMobile, logoLogin: data.logoLogin } }),
      ]);
      toast('Configuracion guardada', 'success');
      generalForm.reset(data);
    } catch { toast('Error al guardar', 'error'); } finally { setSaving(false); }
  };

  const handleSaveEmailConfig = async () => {
    setSavingEmailConfig(true);
    try {
      await api.put('/email/config', { ...emailConfig, notifications: notifs });
      toast('Configuracion guardada', 'success');
    } catch { toast('Error', 'error'); } finally { setSavingEmailConfig(false); }
  };

  const handleSaveNotifs = async () => {
    try {
      await api.put('/email/config', { ...emailConfig, notifications: notifs });
      toast('Notificaciones guardadas', 'success');
    } catch { toast('Error', 'error'); }
  };

  const handleTestEmail = async (email: string) => {
    setTestingEmail(true);
    try {
      await api.post('/email/test', { to: email });
      toast('Email de prueba enviado', 'success');
    } catch { toast('Error al enviar email de prueba', 'error'); } finally { setTestingEmail(false); }
  };

  const handleCreateTemplate = async (data: any) => {
    try {
      await api.post('/email/templates', { ...data, type: 'campaign' });
      toast('Plantilla creada', 'success');
      setTemplateModal(false);
      loadEmailData();
    } catch { toast('Error al crear plantilla', 'error'); }
  };

  const handleUpdateTemplate = async (id: string, data: any) => {
    try {
      await api.put('/email/templates/' + id, data);
      toast('Plantilla actualizada', 'success');
      setTemplateModal(false);
      loadEmailData();
    } catch { toast('Error al actualizar plantilla', 'error'); }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Eliminar esta plantilla?')) return;
    try {
      await api.delete('/email/templates/' + id);
      toast('Plantilla eliminada', 'success');
      loadEmailData();
    } catch { toast('Error al eliminar', 'error'); }
  };

  const handleCreateCampaign = async (data: { name: string; templateId: string; recipients: string[] }) => {
    try {
      await api.post('/email/campaigns', data);
      toast('Campana creada', 'success');
      setCampaignModal(false);
      loadEmailData();
    } catch { toast('Error al crear campana', 'error'); }
  };

  const handleSendCampaign = async (id: string) => {
    try {
      await api.post('/email/campaigns/' + id + '/send');
      toast('Campana enviada', 'success');
      loadEmailData();
    } catch { toast('Error al enviar campana', 'error'); }
  };

  const handleLoadRecipients = async (source: 'all' | 'customers' | 'newsletter') => {
    try {
      const res = await api.get('/email/recipients?source=' + source);
      setRecipients(Array.isArray(res.data) ? res.data : []);
    } catch { setRecipients([]); }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administra las preferencias del BackOffice</p>
      </div>

      <div className="w-full bg-gray-50 rounded-xl p-1.5 border border-gray-200">
        <div className="flex items-center gap-1 overflow-x-auto lg:overflow-visible lg:justify-between">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={'flex-shrink-0 lg:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ' +
                  (isActive
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'text-gray-500 hover:bg-white hover:text-gray-700')}
              >
                <Icon className={'w-4 h-4 shrink-0 ' + (isActive ? 'text-[#C8FF00]' : 'text-gray-400')} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'general' && (
          <GeneralTab generalForm={generalForm} onSave={handleSaveGeneral} saving={saving} />
        )}

        {activeTab === 'home_sections' && (
          <HomeSectionsTab />
        )}

        {activeTab === 'meta_pixel' && (
          <MetaPixelTab />
        )}

        {activeTab === 'seguridad' && (
          <SeguridadTab toast={toast} />
        )}

        {activeTab === 'notificaciones' && (
          <NotificacionesTab notifs={notifs} setNotifs={setNotifs} onSave={handleSaveNotifs} />
        )}

        {activeTab === 'emails' && (
          <div className="space-y-6">
            <EmailsTab
              emailConfig={emailConfig}
              setEmailConfig={setEmailConfig}
              onSave={handleSaveEmailConfig}
              onTest={handleTestEmail}
              saving={savingEmailConfig}
              testing={testingEmail}
            />
            <PlantillasTab
              templates={templates}
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              templateModal={templateModal}
              setTemplateModal={setTemplateModal}
              onCreate={handleCreateTemplate}
              onUpdate={handleUpdateTemplate}
              onDelete={handleDeleteTemplate}
            />
            <CampanasTab
              campaigns={campaigns}
              templates={templates}
              recipients={recipients}
              campaignModal={campaignModal}
              setCampaignModal={setCampaignModal}
              onCreate={handleCreateCampaign}
              onSend={handleSendCampaign}
              onLoadRecipients={handleLoadRecipients}
            />
          </div>
        )}
      </div>
    </div>
  );
}