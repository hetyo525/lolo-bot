const { Task } = require('klasa');
const Axios = require('axios');
const axiosRetry = require('axios-retry');

const axios = Axios.create({
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  responseType: 'json',
});
axiosRetry(axios, {
  retries: 3,
  retryDelay: (count) => {
    return count * 2000;
  },
});

module.exports = class extends Task {
  constructor(...args) {
    super(...args, { name: 'youTubeLiveNotice', enabled: true });
  }

  async run() {
    const imap = this.client.providers.get('imap');
    const mails = await imap.fetchNewestMails();

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
          }, index * 2000) // 同時に POST すると 429 になるので少しずらす
      )
    );
  }

  async init() {
    /*
     * You can optionally define this method which will be run when the bot starts
     * (after login, so discord data is available via this.client)
     */
    this.run();
  }
};
