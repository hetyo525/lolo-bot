const { Task } = require('klasa');

module.exports = class extends Task {
  async init() {
    await this.client.schedule.clear();
    await this.client.schedule.create('youTubeLiveNotice', '* * * * *');
  }
};
