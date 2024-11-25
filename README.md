# bootcamp-slack-app

A Slack App which allows booking Bootcamp sessions.

## Getting Started

This project uses [**Deno**](https://deno.com/). You can install it on macOS
using Homebrew: `brew install deno`.

## Configuration

The project uses a `.env` file to store environment variables. The following
variables are required:

- `SLACK_APP_TOKEN`: A token starting with `xapp-` to authenticate the WebSocket
  client to the Slack service.
- `SLACK_BOT_TOKEN`: A token starting with `xoxb-` to authenticate the HTTP
  client to the Slack service.
- `SLACK_CHANNEL`: The channel ID starting with `C` where the app will send
  messages to.

For development, it is recommended practice to create a dedicated free tier
Slack workspace and generate the tokens there. This gives you enough freedom to
test the app without affecting any production workspace and alerting users.

## Running the project

After installing Deno and configuration, you can run the project using the
following command:

    deno task dev
