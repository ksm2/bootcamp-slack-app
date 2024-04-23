import { LocalDate } from "../domain/LocalDate.ts";
import { Session } from "../domain/Session.ts";
import { User } from "../domain/User.ts";
import { Logger } from "./Logger.ts";
import { SessionPresenter } from "./SessionPresenter.ts";
import { SessionRepository } from "./SessionRepository.ts";
import { HelpPrinter } from "./HelpPrinter.ts";

export class Application {
  readonly #logger: Logger;
  readonly #sessionPresenter: SessionPresenter;
  readonly #sessionRepository: SessionRepository;
  readonly #helpPrinter: HelpPrinter;
  readonly #sessions: Map<string, Session> = new Map();

  constructor({
    logger,
    sessionPresenter,
    sessionRepository,
    helpPrinter,
  }: {
    logger: Logger;
    sessionPresenter: SessionPresenter;
    sessionRepository: SessionRepository;
    helpPrinter: HelpPrinter;
  }) {
    this.#logger = logger;
    this.#sessionPresenter = sessionPresenter;
    this.#sessionRepository = sessionRepository;
    this.#helpPrinter = helpPrinter;
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
        return date.addDays(1);
      case LocalDate.MONDAY:
        return date;
      case LocalDate.TUESDAY:
        return date;
      case LocalDate.WEDNESDAY:
        return date.addDays(1);
      case LocalDate.THURSDAY:
        return date;
      case LocalDate.FRIDAY:
        return date.addDays(3);
      case LocalDate.SATURDAY:
      default:
        return date.addDays(2);
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
    { dateString, sessionId, user, channel }: {
      dateString?: string;
      sessionId?: string;
      user: User;
      channel: string;
    },
  ) {
    let session: Session;
    try {
      session = this.findSession({ dateString, sessionId });
    } catch (error) {
      this.#logger.warn(error.message);
      await this.#helpPrinter.printInfo(user.id, channel, error.message);
      return;
    }

    const index = session.participants.indexOf(user.id);
    if (index >= 0) {
      this.#logger.warn("User already part of session:", user);
      await this.#helpPrinter.printInfo(
        user.id,
        channel,
        `You already joined the bootcamp on ${session.date.toHuman()}.`,
      );
    } else {
      session.participants.push(user.id);
      await this.#sessionPresenter.representSession(session);
      await this.#sessionRepository.saveSession(session);
      await this.#helpPrinter.printInfo(
        user.id,
        channel,
        `You are joining the bootcamp on ${session.date.toHuman()}.`,
      );
    }
  }

  async quitSession(
    { dateString, sessionId, user, channel }: {
      dateString?: string;
      sessionId?: string;
      user: User;
      channel: string;
    },
  ) {
    let session: Session;
    try {
      session = this.findSession({ dateString, sessionId });
    } catch (error) {
      this.#logger.warn(error.message);
      await this.#helpPrinter.printInfo(user.id, channel, error.message);
      return;
    }

    const index = session.participants.indexOf(user.id);
    if (index >= 0) {
      session.participants.splice(index, 1);
      await this.#sessionPresenter.representSession(session);
      await this.#sessionRepository.saveSession(session);
      await this.#helpPrinter.printInfo(
        user.id,
        channel,
        `You are not joining the bootcamp on ${session.date.toHuman()} anymore.`,
      );
    } else {
      this.#logger.warn("User is not part of session:", user);
      await this.#helpPrinter.printInfo(
        user.id,
        channel,
        `You have not joined the bootcamp on ${session.date.toHuman()}.`,
      );
    }
  }

  private findSession(
    { dateString, sessionId }: { dateString?: string; sessionId?: string },
  ): Session {
    if (sessionId) {
      const session = this.#sessions.get(sessionId);
      if (!session) {
        throw new Error("No session with ID " + sessionId);
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
      const session = this.findSessionForDate(tomorrow);
      if (!session) {
        throw new Error("No session for tomorrow");
      }
      return session;
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
        const session = this.findSessionForDate(nextWeekday);
        if (!session) {
          throw new Error(`No session on ${weekday}`);
        }
        return session;
      }
    }

    throw new Error("Invalid date: " + dateString);
  }

  private findNextSession(): Session {
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

    if (!result) {
      throw new Error("No next session found");
    }

    return result;
  }

  async printHelp(args: { user: User; channel: string }): Promise<void> {
    await this.#helpPrinter.printHelp(args.user.id, args.channel);
  }
}
