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
axiosRetry(axios, { retries: 3 });

module.exports = class extends Task {
  constructor(...args) {
    super(...args, { name: 'glitchWarming', enabled: true });
  }

  async run() {
    await axios.get(process.env.PROJECT_URL);
  }

  async init() {
    /*
     * You can optionally define this method which will be run when the bot starts
     * (after login, so discord data is available via this.client)
     */
  }
};
