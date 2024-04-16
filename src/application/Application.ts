import crypto from "node:crypto";
import { LocalDate } from "../domain/LocalDate.js";
import { Session } from "../domain/Session.js";
import { User } from "../domain/User.js";
import { SessionPresenter } from "./SessionPresenter.js";
import { SessionRepository } from "./SessionRepository.js";

export class Application {
  readonly #sessionPresenter: SessionPresenter;
  readonly #sessionRepository: SessionRepository;
  readonly #sessions: Map<string, Session> = new Map();

  constructor({
    sessionPresenter,
    sessionRepository,
  }: {
    sessionPresenter: SessionPresenter;
    sessionRepository: SessionRepository;
  }) {
    this.#sessionPresenter = sessionPresenter;
    this.#sessionRepository = sessionRepository;
  }

  async start(): Promise<void> {
    console.log("Starting");
    const existingSessions = await this.#sessionRepository.loadSessions();
    for (const session of existingSessions) {
      this.#sessions.set(session.sessionId, session);
    }
    console.dir(this.#sessions);
    console.info("Sessions loaded");
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
    await this.#sessionRepository.saveSession(session);
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
      await this.#sessionRepository.saveSession(session);
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
      await this.#sessionRepository.saveSession(session);
    } else {
      console.warn("User is not part of session:", user);
    }
  }
}
