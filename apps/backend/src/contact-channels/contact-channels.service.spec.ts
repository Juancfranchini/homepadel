import { shouldExposePublicChannel } from './contact-channels.service';

describe('public contact channels', () => {
  const original = process.env.MESSENGER_CHANNEL_ENABLED;

  afterEach(() => {
    if (original === undefined) delete process.env.MESSENGER_CHANNEL_ENABLED;
    else process.env.MESSENGER_CHANNEL_ENABLED = original;
  });

  it('oculta Messenger por defecto y conserva WhatsApp y email', () => {
    delete process.env.MESSENGER_CHANNEL_ENABLED;
    expect(shouldExposePublicChannel({ title: 'Messenger', url: 'https://m.me/homepadel' })).toBe(false);
    expect(shouldExposePublicChannel({ title: 'WhatsApp', url: 'https://wa.me/54911' })).toBe(true);
    expect(shouldExposePublicChannel({ title: 'Email', url: 'mailto:hola@homepadel.com' })).toBe(true);
  });

  it('permite reactivar Messenger sin cambiar ni borrar sus datos', () => {
    process.env.MESSENGER_CHANNEL_ENABLED = 'true';
    expect(shouldExposePublicChannel({ title: 'Messenger', url: 'https://m.me/homepadel' })).toBe(true);
  });
});
