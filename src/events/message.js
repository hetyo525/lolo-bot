const { Event } = require('klasa');

module.exports = class extends Event {
  constructor(...args) {
    super(...args, { name: 'message', enabled: true, ignoreSelf: true });
  }

  run(message) {
    if (this.client.ready) this.client.monitors.run(message);
    // const { id, author, content, channel } = message;
    // const botId = process.env['DISCORD_BOT_CLIENT_ID'];
    //
    // // bot からの発言は無視
    // if (author.bot) return;
    //
    // if (isReplyTo(botId, content)) {
    //   return;
    // }
    //
    // console.log(content, id, author.bot, channel.id);
  }

  async init() {
    // You can optionally define this method which will be run when the bot starts (after login, so discord data is available via this.client)
  }
};

/**
 * id 宛の Reply か否か
 * @param id
 * @param content
 */
// function isReplyTo(id, content) {
//   return content.includes(`@!${id}`);
// }
