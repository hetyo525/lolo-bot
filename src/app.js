const { Client } = require('klasa');

// Response for Uptime Robot
const http = require('http');

// cache
let _client = null;

(async () => {
  _client = await connectDiscord();

  // Glitch が 5分間リクエストないとスリープに移行するので、受け口を用意
  const server = http.createServer(async function (request, response) {
    if (!_client) {
      _client = await connectDiscord();
    }

    request.on('readable', function () {
      request.read();
    });

    request.on('end', async function () {
      response.end('Discord bot is active now.');
    });
  });

  server.once('close', async function () {
    // このへん動いてないかも。
    await server.removeAllListeners('request');
    await this.client.schedule.clear();
  });

  server.listen(3000);
})();

/**
 * ディスコードと接続する
 * @returns {Promise<void>}
 */
async function connectDiscord() {
  const client = new Client({
    clientOptions: {
      fetchAllMembers: false,
    },
    prefix: '+',
    cmdEditing: true,
    typing: true,
    language: 'ja-JP',
    disabledCorePieces: ['commands'],
    readyMessage: (client) =>
      `${client.user.tag}, Ready to serve ${client.guilds.size} guilds and ${client.users.size} users`,
  });
  await client.login(process.env['DISCORD_BOT_TOKEN']);
  return client;
}
