const { Command } = require('klasa');
const axios = require('axios');

/**
 * https://github.com/dirigeants/klasa-pieces/blob/master/commands/Misc/fox.js
 * @type {exports}
 */
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['fox'],
      description: 'I am 猫(māo), No Fox',
    });
  }

  async run(message) {
    const noFox = Math.random() < 0.15;
    if (noFox) {
      const { data } = await axios.get('http://aws.random.cat/meow');
      return message.channel.sendFile(
        data.file,
        `cat.${data.file.slice(data.file.lastIndexOf('.'), data.file.length)}`
      );
    } else {
      const { data } = await axios.get('https://randomfox.ca/floof/');
      return message.channel.sendFile(data.image);
    }
  }
};
