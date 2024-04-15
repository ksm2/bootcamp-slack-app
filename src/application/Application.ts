import crypto from "node:crypto";
import { LocalDate } from "../domain/LocalDate.js";
import { SessionPresenter } from "./SessionPresenter.js";
import { Session } from "../domain/Session.js";
import { User } from "../domain/User.js";

export class Application {
  readonly #sessionPresenter: SessionPresenter;
  readonly #sessions: Map<string, Session> = new Map();

  constructor({ sessionPresenter }: { sessionPresenter: SessionPresenter }) {
    this.#sessionPresenter = sessionPresenter;
  }

  async start(): Promise<void> {
    console.log("Starting");
  }

  sessions(): Session[] {
    return [...this.#sessions.values()];
  }

  async createSession(): Promise<void> {
    const session = {
      sessionId: crypto.randomUUID(),
      date: LocalDate.today(),
      participants: [],
    } satisfies Session;

    this.#sessions.set(session.sessionId, session);
    await this.#sessionPresenter.presentSession(session);
  }

  async joinSession({ sessionId, user }: { sessionId: string; user: User }) {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      console.error("No session with ID:", sessionId);
      return;
    }

    const index = session.participants.indexOf(user.id);
    if (index >= 0) {
      console.warn("User already part of session:", user);
    } else {
      session.participants.push(user.id);
      await this.#sessionPresenter.presentSession(session);
    }
  }

  async quitSession({ sessionId, user }: { sessionId: string; user: User }) {
    const session = this.#sessions.get(sessionId);
    if (!session) {
      console.error("No session with ID:", sessionId);
      return;
    }

    const index = session.participants.indexOf(user.id);
    if (index >= 0) {
      session.participants.splice(index, 1);
      await this.#sessionPresenter.presentSession(session);
    } else {
      console.warn("User is not part of session:", user);
    }
  }
}
