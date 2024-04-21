import EventEmitter from "node:events";
import { CronJob } from "cron";
import dotenv from "dotenv";
import express from "express";
import { Level } from "level";
import { SocketModeClient } from "@slack/socket-mode";
import { WebClient } from "@slack/web-api";
import { Application } from "./application/Application.js";
import { WebClientSessionPresenter } from "./adapters/WebClientSessionPresenter.js";
import { LevelSessionRepository } from "./adapters/LevelSessionRepository.js";
import { Session } from "./domain/Session.js";
import { LocalDate } from "./domain/LocalDate.js";

dotenv.config();

const appToken = process.env.SLACK_APP_TOKEN;
const botToken = process.env.SLACK_BOT_TOKEN;
const channel = process.env.SLACK_CHANNEL!;
const dbLocation = process.env.DB_LOCATION!;

const db = new Level<string, Session>(dbLocation, {
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
const repository = new LevelSessionRepository(db);

const socketModeClient = new SocketModeClient({ appToken });
const webClient = new WebClient(botToken);

await socketModeClient.start();

const application = new Application({
  sessionPresenter: new WebClientSessionPresenter(webClient, channel),
  sessionRepository: repository,
});

const actionEmitter = new EventEmitter();

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

app.get("/sessions", async (req, res) => {
  res.send(application.sessions());
});

app.listen(8080, () => {
  console.log("App running on http://localhost:8080");
});
