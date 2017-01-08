'use strict';

const Botkit = require('botkit');

const slackBotToken = process.env.SLACK_BOT_TOKEN;

if (!slackBotToken) {
  console.log('Error: Specify token in environment');
  process.exit(1);
}

const controller = Botkit.slackbot({
  debug: !!process.env.DEBUG
});

const bot = controller.spawn({
  token: slackBotToken
})

bot.startRTM(function(err, bot, payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

/*
   This KPI bot waits for you to call him. Here is sample usage.

   Format: @bot-name summary $from_date $to_date
     - from_date: Required. Start of time range of messages.
     - to_date:   Optional. End of time range of messages.
   Sample: @bot-name 2016/11/01 2016/11/30

   The bot gathers KPTs you posted between 2016/11/01 and 2016/11/30
   from history of a channel you called the bot.

   ```
   K
   - Started daily meeting
   - Find a release blocker earlier
   P
   - Cannot help each other... :cry:
   T
   - How about going lunch? :smile:
   ```
 */
controller.hears("^summary (.+)",["direct_message","direct_mention","mention"], (bot, message) => {
  const [from_date, to_date] = message.match[1].split(' ');

  let params = {
    token: slackBotToken,
    channel: message.channel,
    oldest: (new Date(from_date) / 1000),
    count: 1000,
  }

  // `latest` is optional parameter, and its default value is `now`.
  if (to_date) {
    // When the given date is formatted as `2017/1/5`, it will be handled as `End time of the 2017/01/05`
    to_time = /^\d+\/\d{1,2}\/\d{1,2}$/.test(to_date) ? (to_date + " 23:59:59:999" ) : to_date
    params.latest = new Date(to_time) / 1000
  }

  let users;

  const fetchUserListDone = (err, res) => {
    checkError(err)
    users = res.members
    // https://api.slack.com/methods/channels.history
    bot.api.callAPI('channels.history', params, postSummary);
  }

  const postSummary = (err, res) => {
    checkError(err)

    let result = { K: [], P: [], T: [] }

    for (const message of res.messages) {
      const matched = message.text.match(/^([KkPpTt])\s+(.+)/);

      if (matched) {
        result[matched[1].toUpperCase()].push({
          content: matched[2],
          userId: message.user,
          reactions: (message.reactions || []),
        });
      }
    }

    bot.reply(message, createSummary(result, users));
  }

  // https://api.slack.com/methods/users.list
  bot.api.callAPI('users.list', params, fetchUserListDone)
});

/*
   If no command matched, show usage.
 */
controller.hears("^((?!summary).)*$",["direct_message","direct_mention","mention"], (bot, message) => {
  const reply = `
Sorry, I can't understand the order. :cry: Can you try again?
Format: @bot-name summary $from_date $to_date
 - from_date: Required. Start of time range of messages.
 - to_date:   Optional. End of time range of messages.
Sample: @bot-name summary 2016/11/01 2016/11/30
`
  bot.reply(message, reply);
});

const checkError = (err) => {
  if (err) {
    throw new Error(`Slack API returns an error. error code: ${err}`);
  }
}

const createSummary = (result, users) => {
  return ['K', 'P', 'T'].map((section) => {
    return `## ${section}\n\n${createSectionSummary(result[section], users)}\n`
  }).join('\n')
}

const createSectionSummary = (elements, users) => {
  return elements.map(e => {
    const username = users.find(u => u.id == e.userId).name;
    const reactions = e.reactions.map(r => ` :${r.name}: `.repeat(r.count)).join('');

    return `- ${e.content} by ${username} ${reactions}`;
  }).join('\n')
}
