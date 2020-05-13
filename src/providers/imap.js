const { Provider } = require('klasa');
const Imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;

/**
 * IMAP Client
 * @type {exports}
 */
module.exports = class extends Provider {
  constructor(...args) {
    super(...args, { description: 'IMAP Client' });
    this.imap = null;
  }

  async init() {
    this.imap = await Imaps.connect({
      imap: {
        user: process.env['IMAP_MAIL_ADDRESS'],
        password: process.env['IMAP_MAIL_PASSWORD'],
        host: process.env['IMAP_MAIL_HOST'],
        port: +process.env['IMAP_MAIL_PORT'],
        tls: true,
        authTimeout: 10000,
      },
    });
  }

  /**
   * 最新の未読メールを取得する
   * @returns {Promise<any[]>}
   */
  async fetchNewestMails() {
    // 対象のメールボックスから「未読」のメールを取得する（取得時に「既読」にする）
    await this.imap.openBox(process.env['MAIL_BOX_NAME']);
    const mails = await this.imap.search(['UNSEEN'], { bodies: ['HEADER', 'TEXT', ''], markSeen: true });

    return await Promise.all(
      mails.map((mail) => {
        const all = mail.parts.find((x) => x.which === '');
        const id = mail.attributes.uid;
        return simpleParser(`Imap-Id: ${id}\r\n${all.body}`);
      })
    );
  }
};
