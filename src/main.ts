import { EventEmitter } from "@denosaurs/event";
import { LogLevel, SocketModeClient } from "@slack/socket-mode";
import { WebClient } from "@slack/web-api";
import { load } from "@std/dotenv";
import { CronJob } from "cron";
// @deno-types="npm:@types/express@^4.17.21"
import express from "express";
import { Level } from "level";
import { LevelSessionRepository } from "./adapters/LevelSessionRepository.ts";
import { Logger } from "./application/Logger.ts";
import { SlackActions } from "./adapters/SlackActions.ts";
import { SlackSessionPresenter } from "./adapters/SlackSessionPresenter.ts";
import { Application } from "./application/Application.ts";
import { LocalDate } from "./domain/LocalDate.ts";
import { Session } from "./domain/Session.ts";
import { User } from "./domain/User.ts";
import { SlackHelpPrinter } from "./adapters/SlackHelpPrinter.ts";

await load({ export: true });

const appToken = Deno.env.get("SLACK_APP_TOKEN");
const botToken = Deno.env.get("SLACK_BOT_TOKEN");
const channel = Deno.env.get("SLACK_CHANNEL");
const dbLocation = Deno.env.get("DB_LOCATION") ?? "data";

if (!channel) {
  throw new Error("Please provide SLACK_CHANNEL");
}

const db = new Level(dbLocation);
const sessions = db.sublevel<string, Session>("sessions", {
  valueEncoding: {
    name: "session",
    format: "utf8",
    encode: (data: Session): string => JSON.stringify(data),
    decode: (data: string): Session =>
      JSON.parse(data, (key, value) => {
        if (key === "date") {
          return LocalDate.parse(value);
        } else {
          return value;
        }
      }),
  },
});
const repository = new LevelSessionRepository(sessions);

const socketModeClient = new SocketModeClient({
  appToken,
  logger: new Logger("SocketModeClient", LogLevel.INFO),
});
const webClient = new WebClient(botToken);

await socketModeClient.start();

const application = new Application({
  logger: new Logger("Application"),
  sessionPresenter: new SlackSessionPresenter(webClient, channel),
  sessionRepository: repository,
  helpPrinter: new SlackHelpPrinter(webClient),
});

interface Action {
  value: string;
}

const actionEmitter = new EventEmitter<{ [action: string]: [Action, any] }>();

const cronJobLogger = new Logger("CronJob");
CronJob.from({
  cronTime: "0 8 * * *",
  start: true,
  runOnInit: false,
  onTick: async () => {
    cronJobLogger.debug(`CronJob running on ${LocalDate.today()} at 8:00 AM`);
    await application.createSessions();
    await application.presentSessionOfToday();
  },
});

actionEmitter.on(SlackActions.QUIT, async (action, body) => {
  await application.quitSession({
    sessionId: action.value,
    user: body.user,
  });
});

actionEmitter.on(SlackActions.JOIN, async (action, body) => {
  await application.joinSession({
    sessionId: action.value,
    user: body.user,
  });
});

socketModeClient.on("interactive", async ({ body, ack }) => {
  await ack();
  if (body.type === "block_actions") {
    for (const action of body.actions) {
      actionEmitter.emit(action.action_id, action, body);
    }
  }
});

socketModeClient.on("slash_commands", async ({ body, ack }) => {
  if (body.command === "/bootcamp") {
    await ack();
    const text: string = body.text;
    const args = text.split(/\s+/g).map((arg) => arg.toLowerCase());
    const user = { id: body.user_id } satisfies User;
    switch (args[0]) {
      case "help": {
        await application.printHelp({ user, channel: body.channel_id });
        break;
      }
      case "join": {
        await application.joinSession({ dateString: args[1], user });
        break;
      }
      case "quit": {
        await application.quitSession({ dateString: args[1], user });
        break;
      }
      default: {
        const text = "I didn't catch that. " +
          "Try `/bootcamp join` to join the next session or `/bootcamp quit` to remove yourself from the next session.";
        await webClient.chat.postEphemeral({
          user: body.user_id,
          channel: body.channel_id,
          text,
        });
        break;
      }
    }
  }
});

await application.start();

const logger = new Logger("Express");
const app = express();

app.use(express.json());

app.get("/sessions", (_req, res) => {
  res.send(application.sessions());
});

app.listen(8080, () => {
  logger.info("Server running on http://localhost:8080");
});
