import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Email')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('email')
export class EmailController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // === PLANTILLAS ===
  @Get('templates')
  async getTemplates() {
    return this.prisma.emailTemplate.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.prisma.emailTemplate.findUnique({ where: { id } });
  }

  @Post('templates')
  async createTemplate(@Body() dto: { name: string; subject: string; content: string; type?: string }) {
    return this.prisma.emailTemplate.create({
      data: {
        name: dto.name,
        subject: dto.subject,
        content: dto.content,
        type: dto.type || 'campaign',
      },
    });
  }

  @Put('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() dto: { name?: string; subject?: string; content?: string; type?: string; active?: boolean },
  ) {
    return this.prisma.emailTemplate.update({ where: { id }, data: dto });
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return this.prisma.emailTemplate.delete({ where: { id } });
  }

  // === CAMPAÃƒâ€˜AS ===
  @Get('campaigns')
  async getCampaigns() {
    return this.prisma.emailCampaign.findMany({
      include: { template: { select: { id: true, name: true, subject: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('campaigns')
  async createCampaign(@Body() dto: { name: string; templateId: string; recipients: string[] }) {
    return this.prisma.emailCampaign.create({
      data: {
        name: dto.name,
        templateId: dto.templateId,
        recipients: dto.recipients,
        status: 'DRAFT',
      },
    });
  }

  @Post('campaigns/:id/send')
  async sendCampaign(@Param('id') id: string) {
    const campaign = await this.prisma.emailCampaign.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!campaign) throw new Error('Campana no encontrada');
    if (campaign.status === 'SENT') throw new Error('Campana ya enviada');

    const results = [];
    for (const recipient of campaign.recipients) {
      try {
        await this.emailService.sendCampaign(recipient, campaign.template.subject, campaign.template.content);
        results.push({ email: recipient, success: true });
      } catch (error) {
        results.push({ email: recipient, success: false, error: error.message });
      }
    }

    await this.prisma.emailCampaign.update({
      where: { id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    return { results, total: campaign.recipients.length, sent: results.filter(r => r.success).length };
  }

  @Delete('campaigns/:id')
  async deleteCampaign(@Param('id') id: string) {
    return this.prisma.emailCampaign.delete({ where: { id } });
  }

  // === DESTINATARIOS ===
  @Get('recipients')
  async getRecipients(@Query('source') source: string) {
    const recipients = new Set<string>();

    if (!source || source === 'all' || source === 'customers') {
      const users = await this.prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: { email: true, name: true },
      });
      users.forEach(u => recipients.add(u.email));
    }

    if (!source || source === 'all' || source === 'newsletter') {
      const subscribers = await this.prisma.newsletter.findMany({
        where: { active: true },
        select: { email: true },
      });
      subscribers.forEach(s => recipients.add(s.email));
    }

    return Array.from(recipients);
  }

  // === TEST ===
  @Post('test')
  async testEmail(@Body() body: { to: string; templateId?: string }) {
    return this.emailService.sendTestEmail(body.to, body.templateId);
  }

  // === CONFIG ===
  @Get('config')
  async getConfig() {
    const section = await this.prisma.siteSection.findUnique({ where: { key: 'email_settings' } });
    return section?.data || null;
  }

  @Put('config')
  async updateConfig(@Body() dto: any) {
    return this.prisma.siteSection.upsert({
      where: { key: 'email_settings' },
      update: { data: dto as any, active: true },
      create: { key: 'email_settings', data: dto as any, active: true },
    });
  }
}