import EmailsTab from './EmailsTab';
import PlantillasTab from './PlantillasTab';
import CampanasTab from './CampanasTab';

export default function EmailsSection(props: {
  emailConfig: any; setEmailConfig: (c: any) => void; onSaveEmailConfig: () => void; onTestEmail: (email: string) => void;
  savingEmailConfig: boolean; testingEmail: boolean;
  templates: any[]; selectedTemplate: any; setSelectedTemplate: (t: any) => void; templateModal: boolean; setTemplateModal: (v: boolean) => void;
  onCreateTemplate: (data: any) => void; onUpdateTemplate: (id: string, data: any) => void; onDeleteTemplate: (id: string) => void;
  campaigns: any[]; recipients: string[]; campaignModal: boolean; setCampaignModal: (v: boolean) => void;
  onCreateCampaign: (data: { name: string; templateId: string; recipients: string[] }) => void; onSendCampaign: (id: string) => void;
  onLoadRecipients: (source: 'all' | 'customers' | 'newsletter') => void;
}) {
  return (
    <div className="space-y-6">
      <EmailsTab
        emailConfig={props.emailConfig}
        setEmailConfig={props.setEmailConfig}
        onSave={props.onSaveEmailConfig}
        onTest={props.onTestEmail}
        saving={props.savingEmailConfig}
        testing={props.testingEmail}
      />
      <PlantillasTab
        templates={props.templates}
        selectedTemplate={props.selectedTemplate}
        setSelectedTemplate={props.setSelectedTemplate}
        templateModal={props.templateModal}
        setTemplateModal={props.setTemplateModal}
        onCreate={props.onCreateTemplate}
        onUpdate={props.onUpdateTemplate}
        onDelete={props.onDeleteTemplate}
      />
      <CampanasTab
        campaigns={props.campaigns}
        templates={props.templates}
        recipients={props.recipients}
        campaignModal={props.campaignModal}
        setCampaignModal={props.setCampaignModal}
        onCreate={props.onCreateCampaign}
        onSend={props.onSendCampaign}
        onLoadRecipients={props.onLoadRecipients}
      />
    </div>
  );
}
