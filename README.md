# Slack bot for KPT retrospect

## What's this?

It's a Slack bot to encourage us KPT retrospect.

<img width="599" alt="2016-12-24 11 37 38" src="https://cloud.githubusercontent.com/assets/1811616/21464850/942acbdc-c9cd-11e6-92f5-79cc0453b8d9.png">

## Usage

- Post any messages starting with "K " or "P " or "T " as like...
  - "K Found a good restaurant near our office"
  - "P This project is getting delayed..."
  - "T Start daily meeting"
- Call your KPT bot when you want to start retrospect with posted KPTs.

### Format

`@bot-name summary $from_date $to_date`

- from_date: Required. Start of a time range of messages.
- to_date:   Optional. End of a time range of messages.

### Sample

`@bot-name summary 2016-11-01 2016-11-30`

The bot gathers KPTs you posted from 2016-11-01 and 2016-11-30 from a history of a channel you called the bot.

## Why not use another tool?

Actually, there are many tools to do it, but most of them are not for "daily use".

We think of good ideas anytime we live. To memorize them, you open your laptop and start the app or website to record your ideas. If you're out and do not have a good device to do it... Ugh, that's tiresome.

Slack is now our "daily use" tool and there are fewer barriers to prevent us to track our KPTs.

## Develop

```sh
$ git clone git@github.com:ohbarye/kpt-bot.git
$ npm install -g yarn && yarn
$ SLACK_BOT_TOKEN=your-slack-bot-token node index.js
```

## Deployment

If you want to deploy to Heroku, just click following button.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Run with Docker

Pull the Docker image and run with your Slack bot token.

```bash
docker pull ohbarye/kpt-bot
docker run -e SLACK_BOT_TOKEN=your-slack-bot-token kpt-bot
```

## Environment Variables

### SLACK_BOT_TOKEN (required)

Slack bot API token.

If you do not have it yet, visit https://my.slack.com/services/new/bot and get the token.
