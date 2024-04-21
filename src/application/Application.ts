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
    console.info("Sessions loaded");
    await this.createSessions();
    console.info("Sessions created");

    console.dir(this.#sessions);
  }

  sessions(): Session[] {
    return [...this.#sessions.values()];
  }

  async createSessions(): Promise<void> {
    const nextDates = this.calculateNextDates();
    await this.createSessionsForDatesIfNotExist(nextDates);
  }

  private calculateNextDates(): LocalDate[] {
    const date1 = this.calculateNextDateFrom(LocalDate.today());
    const date2 = this.calculateNextDateFrom(date1.tomorrow());
    const date3 = this.calculateNextDateFrom(date2.tomorrow());

    return [date1, date2, date3];
  }

  private calculateNextDateFrom(date: LocalDate): LocalDate {
    switch (date.weekday) {
      case LocalDate.SUNDAY:
        return date.tomorrow();
      case LocalDate.MONDAY:
        return date;
      case LocalDate.TUESDAY:
        return date;
      case LocalDate.WEDNESDAY:
        return date.tomorrow();
      case LocalDate.THURSDAY:
        return date;
      case LocalDate.FRIDAY:
        return date.tomorrow().tomorrow().tomorrow();
      case LocalDate.SATURDAY:
      default:
        return date.tomorrow().tomorrow();
    }
  }

  private async createSessionsForDatesIfNotExist(
    dates: LocalDate[],
  ): Promise<void> {
    for (const date of dates) {
      const session = this.findSessionForDate(date);
      if (session === undefined) {
        await this.createSessionForDate(date);
      }
    }
  }

  private findSessionForDate(date: LocalDate): Session | undefined {
    for (const session of this.#sessions.values()) {
      if (session.date.equals(date)) {
        return session;
      }
    }

    return undefined;
  }

  private async createSessionForDate(date: LocalDate): Promise<void> {
    const sessionId = crypto.randomUUID();
    const session = { sessionId, date, participants: [] } satisfies Session;

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
