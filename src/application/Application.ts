import { LocalDate } from "../domain/LocalDate.ts";
import { Session } from "../domain/Session.ts";
import { User } from "../domain/User.ts";
import { Logger } from "./Logger.ts";
import { SessionPresenter } from "./SessionPresenter.ts";
import { SessionRepository } from "./SessionRepository.ts";

export class Application {
  readonly #logger: Logger;
  readonly #sessionPresenter: SessionPresenter;
  readonly #sessionRepository: SessionRepository;
  readonly #sessions: Map<string, Session> = new Map();

  constructor({
    logger,
    sessionPresenter,
    sessionRepository,
  }: {
    logger: Logger;
    sessionPresenter: SessionPresenter;
    sessionRepository: SessionRepository;
  }) {
    this.#logger = logger;
    this.#sessionPresenter = sessionPresenter;
    this.#sessionRepository = sessionRepository;
  }

  async start(): Promise<void> {
    this.#logger.debug("Application starting");

    const existingSessions = await this.#sessionRepository.loadSessions();
    for (const session of existingSessions) {
      this.#sessions.set(session.sessionId, session);
    }
    this.#logger.info(
      `Loaded ${existingSessions.length} sessions from repository`,
    );
    await this.createSessions();
    await this.presentSessionOfToday();

    this.#logger.info("Application started");
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
    await this.#sessionRepository.saveSession(session);
    this.#logger.debug(`Created session ${session}`);
  }

  async presentSessionOfToday(): Promise<void> {
    const today = LocalDate.today();
    const session = this.findSessionForDate(today);
    if (session) {
      await this.#sessionPresenter.presentSession(session);
    } else {
      this.#logger.warn("No session for today");
    }
  }

  async joinSession(
    { dateString, sessionId, user }: {
      dateString?: string;
      sessionId?: string;
      user: User;
    },
  ) {
    const session = this.findSession({ dateString, sessionId });
    if (!session) return;

    const index = session.participants.indexOf(user.id);
    if (index >= 0) {
      this.#logger.warn("User already part of session:", user);
    } else {
      session.participants.push(user.id);
      await this.#sessionPresenter.representSession(session);
      await this.#sessionRepository.saveSession(session);
    }
  }

  async quitSession(
    { dateString, sessionId, user }: {
      dateString?: string;
      sessionId?: string;
      user: User;
    },
  ) {
    const session = this.findSession({ dateString, sessionId });
    if (!session) return;

    const index = session.participants.indexOf(user.id);
    if (index >= 0) {
      session.participants.splice(index, 1);
      await this.#sessionPresenter.representSession(session);
      await this.#sessionRepository.saveSession(session);
    } else {
      this.#logger.warn("User is not part of session:", user);
    }
  }

  private findSession(
    { dateString, sessionId }: { dateString?: string; sessionId?: string },
  ): Session | undefined {
    if (sessionId) {
      const session = this.#sessions.get(sessionId);
      if (!session) {
        this.#logger.error("No session with ID:", sessionId);
        return undefined;
      }

      return session;
    }

    if (
      dateString === "today" || dateString === "next" || dateString === "now" ||
      dateString === undefined
    ) {
      return this.findNextSession();
    }

    if (dateString === "tomorrow") {
      const tomorrow = LocalDate.today().tomorrow();
      return this.findSessionForDate(tomorrow);
    }

    const weekdays = [
      ["monday", LocalDate.MONDAY],
      ["tuesday", LocalDate.TUESDAY],
      ["wednesday", LocalDate.WEDNESDAY],
      ["thursday", LocalDate.THURSDAY],
      ["friday", LocalDate.FRIDAY],
      ["saturday", LocalDate.SATURDAY],
      ["sunday", LocalDate.SUNDAY],
    ] as const;

    for (const [weekday, day] of weekdays) {
      if (dateString === weekday) {
        const nextWeekday = LocalDate.today().nextWeekday(day);
        return this.findSessionForDate(nextWeekday);
      }
    }

    this.#logger.warn("Invalid date string:", dateString);
    return undefined;
  }

  private findNextSession(): Session | undefined {
    const today = LocalDate.today();
    let result: Session | undefined;
    for (const session of this.#sessions.values()) {
      if (
        !session.date.isBefore(today) &&
        (!result || session.date.isBefore(result.date))
      ) {
        result = session;
      }
    }

    return result;
  }
}
