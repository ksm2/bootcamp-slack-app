import { EventEmitter } from "@denosaurs/event";
import { load } from "@std/dotenv";
import { CronJob } from "cron";
// @deno-types="npm:@types/express@^4.17.21"
import express from "express";
import { Level } from "level";
import { SocketModeClient } from "@slack/socket-mode";
import { WebClient } from "@slack/web-api";
import { Application } from "./application/Application.ts";
import { WebClientSessionPresenter } from "./adapters/WebClientSessionPresenter.ts";
import { LevelSessionRepository } from "./adapters/LevelSessionRepository.ts";
import { Session } from "./domain/Session.ts";
import { LocalDate } from "./domain/LocalDate.ts";

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

const socketModeClient = new SocketModeClient({ appToken });
const webClient = new WebClient(botToken);

await socketModeClient.start();

const application = new Application({
  sessionPresenter: new WebClientSessionPresenter(webClient, channel),
  sessionRepository: repository,
});

interface Action {
  value: string;
}

const actionEmitter = new EventEmitter<{ [action: string]: [Action, any] }>();

CronJob.from({
  cronTime: "0 8 * * *",
  start: true,
  runOnInit: false,
  onTick: async () => {
    await application.createSessions();
  },
});

actionEmitter.on("button_quit", async (action, body) => {
  await application.quitSession({
    sessionId: action.value,
    user: body.user,
  });
});

actionEmitter.on("button_join", async (action, body) => {
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

await application.start();

const app = express();

app.use(express.json());

app.get("/sessions", (_req, res) => {
  res.send(application.sessions());
});

app.listen(8080, () => {
  console.log("App running on http://localhost:8080");
});
