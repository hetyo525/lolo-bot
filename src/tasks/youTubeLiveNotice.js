const { Task } = require('klasa');
const Imaps = require('imap-simple');
const simpleParser = require('mailparser').simpleParser;
const Axios = require('axios');
const axiosRetry = require('axios-retry');

const axios = Axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  responseType: 'json',
});
axiosRetry(axios, { retries: 3 });

module.exports = class extends Task {
  constructor(...args) {
    super(...args, { name: 'youTubeLiveNotice', enabled: true });
  }

  async run() {
    const mails = await fetchNewstMails();

    await Promise.all(
      mails.map(
        async (mail, index) =>
          setTimeout(async () => {
            const matchAvatar = mail.html.match(/.*"(https:\/\/.+googleusercontent\.com.+\.jpg)"/);
            const matchLink = mail.text.match(/.*http(:\/\/.+?)&/);

            await axios.post(process.env['DISCORD_WEBHOOK_URL'], {
              username: mail.subject,
              avatar_url: matchAvatar[1],
              content: `https${matchLink[1]}`,
            });
          }, index * 1000) // 同時に POST すると 429 になるので少しずらす
      )
    );
  }

  async init() {
    /*
     * You can optionally define this method which will be run when the bot starts
     * (after login, so discord data is available via this.client)
     */
  }
};

/**
 * 最新の未読メールを取得する
 * @returns {Promise<any[]>}
 */
async function fetchNewstMails() {
  const connection = await Imaps.connect({
    imap: {
      user: process.env['IMAP_MAIL_ADDRESS'],
      password: process.env['IMAP_MAIL_PASSWORD'],
      host: process.env['IMAP_MAIL_HOST'],
      port: +process.env['IMAP_MAIL_PORT'],
      tls: true,
      authTimeout: 3000,
    },
  });

  // 対象のメールボックスから「未読」のメールを取得する（取得時に「既読」にする）
  await connection.openBox(process.env['MAIL_BOX_NAME']);
  const mails = await connection.search(['UNSEEN'], { bodies: ['HEADER', 'TEXT', ''], markSeen: true });

  const parsedMails = await Promise.all(
    mails.map((mail) => {
      const all = mail.parts.find((x) => x.which === '');
      const id = mail.attributes.uid;
      return simpleParser(`Imap-Id: ${id}\r\n${all.body}`);
    })
  );
  await connection.end();

  return parsedMails;
}
