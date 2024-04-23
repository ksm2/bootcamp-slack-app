import { AbstractLevel } from "abstract-level";
import { SessionRepository } from "../application/SessionRepository.ts";
import { Session } from "../domain/Session.ts";

export class LevelSessionRepository implements SessionRepository {
  readonly #db: AbstractLevel<unknown, string, Session>;

  constructor(db: AbstractLevel<unknown, string, Session>) {
    this.#db = db;
  }

  async loadSessions(): Promise<Session[]> {
    return await this.#db.values().all();
  }

  async saveSession(session: Session): Promise<void> {
    await this.#db.put(session.sessionId, session);
  }
}
