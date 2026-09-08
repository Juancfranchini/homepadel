'use client';

import GeneralTab from './components/GeneralTab';
import SeguridadTab from './components/SeguridadTab';
import NotificacionesTab from './components/NotificacionesTab';
import MetaPixelTab from './components/MetaPixelTab';
import HomeSectionsTab from './components/HomeSectionsTab';
import CloudinaryTab from './components/CloudinaryTab';
import ConfiguracionTabsBar from './components/ConfiguracionTabsBar';
import EmailsSection from './components/EmailsSection';
import { useConfiguracionPage } from './useConfiguracionPage';

export default function ConfiguracionPage() {
  const {
    toast, activeTab, setActiveTab, generalForm, saving, handleSaveGeneral,
    notifs, setNotifs, emailConfig, setEmailConfig, templates, campaigns, recipients,
    savingEmailConfig, testingEmail, handleSaveEmailConfig, handleSaveNotifs, handleTestEmail,
    handleCreateTemplate, handleUpdateTemplate, handleDeleteTemplate, handleCreateCampaign, handleSendCampaign,
    selectedTemplate, setSelectedTemplate, templateModal, setTemplateModal, campaignModal, setCampaignModal,
    handleLoadRecipients,
  } = useConfiguracionPage();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-gray-500 text-sm mt-0.5">Administra las preferencias del BackOffice</p>
      </div>

      <ConfiguracionTabsBar activeTab={activeTab} onChange={setActiveTab} />

      <div className="space-y-6">
        {activeTab === 'general' && <GeneralTab generalForm={generalForm} onSave={handleSaveGeneral} saving={saving} />}
        {activeTab === 'home_sections' && <HomeSectionsTab />}
        {activeTab === 'meta_pixel' && <MetaPixelTab />}
        {activeTab === 'seguridad' && <SeguridadTab toast={toast} />}
        {activeTab === 'notificaciones' && <NotificacionesTab notifs={notifs} setNotifs={setNotifs} onSave={handleSaveNotifs} />}
        {activeTab === 'cloudinary' && <CloudinaryTab />}
        {activeTab === 'emails' && (
          <EmailsSection
            emailConfig={emailConfig}
            setEmailConfig={setEmailConfig}
            onSaveEmailConfig={handleSaveEmailConfig}
            onTestEmail={handleTestEmail}
            savingEmailConfig={savingEmailConfig}
            testingEmail={testingEmail}
            templates={templates}
            selectedTemplate={selectedTemplate}
            setSelectedTemplate={setSelectedTemplate}
            templateModal={templateModal}
            setTemplateModal={setTemplateModal}
            onCreateTemplate={handleCreateTemplate}
            onUpdateTemplate={handleUpdateTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            campaigns={campaigns}
            recipients={recipients}
            campaignModal={campaignModal}
            setCampaignModal={setCampaignModal}
            onCreateCampaign={handleCreateCampaign}
            onSendCampaign={handleSendCampaign}
            onLoadRecipients={handleLoadRecipients}
          />
        )}
      </div>
    </div>
  );
}
