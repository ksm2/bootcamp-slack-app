import { SessionRepository } from "../application/SessionRepository.js";
import { Session } from "../domain/Session.js";
import { Level } from "level";

export class LevelSessionRepository implements SessionRepository {
  readonly #db: Level<string, Session>;

  constructor(db: Level<string, Session>) {
    this.#db = db;
  }

  async loadSessions(): Promise<Session[]> {
    return await this.#db.values().all();
  }

  async saveSession(session: Session): Promise<void> {
    await this.#db.put(session.sessionId, session);
  }
}
