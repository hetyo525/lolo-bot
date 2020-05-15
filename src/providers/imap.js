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
  }

  async init() {
    this.config = {
      imap: {
        user: process.env['IMAP_MAIL_ADDRESS'],
        password: process.env['IMAP_MAIL_PASSWORD'],
        host: process.env['IMAP_MAIL_HOST'],
        port: +process.env['IMAP_MAIL_PORT'],
        tls: true,
        authTimeout: 10000,
      },
    };
    await this.connect();
  }

  /**
   * https://github.com/chadxz/imap-simple/issues/65#issuecomment-604142582
   * @returns {Promise<void>}
   */
  async connect() {
    const me = this;
    try {
      if (!this._c) {
        this._c = await Imaps.connect(this.config);
        console.info(`IMAP connected to ${this.config.imap.host}`);
        this._c.on('error', (err) => {
          // THIS IS REQUIRED not to crash the process on socket error
          console.error(err);
        });
        this._c.imap.on('close', () => {
          this._c = null;
          setTimeout(() => {
            console.debug('IMAP reconnecting after error');
            me.connect();
          }, this.config.imap.authTimeout);
        });
      }
      const boxName = process.env['MAIL_BOX_NAME'];
      await this._c.openBox(boxName);
      console.info(`IMAP ${boxName} opened`);
    } catch (ex) {
      console.error(ex);
      setTimeout(() => {
        console.debug('IMAP initial reconnect');
        me.connect();
      }, this.config.imap.authTimeout);
    }
  }

  /**
   * 最新の未読メールを取得する
   * @returns {Promise<any[]>}
   */
  async fetchNewestMails() {
    // 対象のメールボックスから「未読」のメールを取得する（取得時に「既読」にする）
    await this._c.openBox(process.env['MAIL_BOX_NAME']);
    const mails = await this._c.search(['UNSEEN'], { bodies: ['HEADER', 'TEXT', ''], markSeen: true });

    return await Promise.all(
      mails.map((mail) => {
        const all = mail.parts.find((x) => x.which === '');
        const id = mail.attributes.uid;
        return simpleParser(`Imap-Id: ${id}\r\n${all.body}`);
      })
    );
  }
};
