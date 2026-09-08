import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

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
export type GeneralForm = z.infer<typeof generalSchema>;

export type Tab = 'general' | 'home_sections' | 'meta_pixel' | 'seguridad' | 'notificaciones' | 'emails' | 'cloudinary';

function useGeneralForm() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const generalForm = useForm<GeneralForm>({
    resolver: zodResolver(generalSchema),
    defaultValues: { storeName: 'Home Padel', contactEmail: 'hola@homepadel.com', phone: '', address: '', whatsapp: '' },
  });
  const { reset } = generalForm;

  useEffect(() => {
    Promise.all([api.get('/site-sections/settings'), api.get('/site-sections/branding')]).then(([settingsRes, brandingRes]) => {
      const s = settingsRes.data?.data || settingsRes.data || {};
      const b = brandingRes.data?.data || brandingRes.data || {};
      reset({
        storeName: s.storeName || 'Home Padel', contactEmail: s.contactEmail || 'hola@homepadel.com',
        phone: s.phone || '', address: s.address || '', whatsapp: s.whatsapp || '',
        logoUrl: b.logoHeader || '', logoFooter: b.logoFooter || '', isotipo: b.isotipo || '', logoMobile: b.logoMobile || '',
      });
    }).catch(() => {});
  }, [reset]);

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

  return { generalForm, saving, handleSaveGeneral };
}

function useEmailData() {
  const [notifs, setNotifs] = useState({ newOrder: true, shippedOrder: true, contactForm: true });
  const [emailConfig, setEmailConfig] = useState({ resendApiKey: '', fromEmail: 'Home Padel <noreply@homepadel.com.ar>', adminEmail: 'contactohomepadel@gmail.com' });
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<string[]>([]);

  const loadEmailData = useCallback(async () => {
    try {
      const [configRes, templatesRes, campaignsRes, recipientsRes] = await Promise.all([
        api.get('/email/config'), api.get('/email/templates'), api.get('/email/campaigns'), api.get('/email/recipients?source=all'),
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
  }, []);

  return { notifs, setNotifs, emailConfig, setEmailConfig, templates, campaigns, recipients, setRecipients, loadEmailData };
}

function useEmailActions(emailConfig: any, notifs: any, loadEmailData: () => Promise<void>) {
  const { toast } = useToast();
  const [savingEmailConfig, setSavingEmailConfig] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  const handleSaveEmailConfig = async () => {
    setSavingEmailConfig(true);
    try { await api.put('/email/config', { ...emailConfig, notifications: notifs }); toast('Configuracion guardada', 'success'); }
    catch { toast('Error', 'error'); } finally { setSavingEmailConfig(false); }
  };

  const handleSaveNotifs = async () => {
    try { await api.put('/email/config', { ...emailConfig, notifications: notifs }); toast('Notificaciones guardadas', 'success'); }
    catch { toast('Error', 'error'); }
  };

  const handleTestEmail = async (email: string) => {
    setTestingEmail(true);
    try { await api.post('/email/test', { to: email }); toast('Email de prueba enviado', 'success'); }
    catch { toast('Error al enviar email de prueba', 'error'); } finally { setTestingEmail(false); }
  };

  const handleCreateTemplate = async (data: any) => {
    try { await api.post('/email/templates', { ...data, type: 'campaign' }); toast('Plantilla creada', 'success'); loadEmailData(); }
    catch { toast('Error al crear plantilla', 'error'); }
  };

  const handleUpdateTemplate = async (id: string, data: any) => {
    try { await api.put('/email/templates/' + id, data); toast('Plantilla actualizada', 'success'); loadEmailData(); }
    catch { toast('Error al actualizar plantilla', 'error'); }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Eliminar esta plantilla?')) return;
    try { await api.delete('/email/templates/' + id); toast('Plantilla eliminada', 'success'); loadEmailData(); }
    catch { toast('Error al eliminar', 'error'); }
  };

  const handleCreateCampaign = async (data: { name: string; templateId: string; recipients: string[] }) => {
    try { await api.post('/email/campaigns', data); toast('Campana creada', 'success'); loadEmailData(); }
    catch { toast('Error al crear campana', 'error'); }
  };

  const handleSendCampaign = async (id: string) => {
    try { await api.post('/email/campaigns/' + id + '/send'); toast('Campana enviada', 'success'); loadEmailData(); }
    catch { toast('Error al enviar campana', 'error'); }
  };

  return {
    savingEmailConfig, testingEmail, handleSaveEmailConfig, handleSaveNotifs, handleTestEmail,
    handleCreateTemplate, handleUpdateTemplate, handleDeleteTemplate, handleCreateCampaign, handleSendCampaign,
  };
}

export function useConfiguracionPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [campaignModal, setCampaignModal] = useState(false);

  const { generalForm, saving, handleSaveGeneral } = useGeneralForm();
  const emailData = useEmailData();
  const emailActions = useEmailActions(emailData.emailConfig, emailData.notifs, emailData.loadEmailData);
  const { loadEmailData } = emailData;

  useEffect(() => {
    if (activeTab === 'emails') loadEmailData();
  }, [activeTab, loadEmailData]);

  const handleLoadRecipients = async (source: 'all' | 'customers' | 'newsletter') => {
    try {
      const res = await api.get('/email/recipients?source=' + source);
      emailData.setRecipients(Array.isArray(res.data) ? res.data : []);
    } catch { emailData.setRecipients([]); }
  };

  return {
    toast, activeTab, setActiveTab, generalForm, saving, handleSaveGeneral,
    ...emailData, ...emailActions,
    selectedTemplate, setSelectedTemplate, templateModal, setTemplateModal, campaignModal, setCampaignModal,
    handleLoadRecipients,
  };
}
