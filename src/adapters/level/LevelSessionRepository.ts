import { AbstractLevel } from "abstract-level";
import { SessionRepository } from "../../application/SessionRepository.ts";
import { Session } from "../../domain/Session.ts";

export class LevelSessionRepository implements SessionRepository {
  readonly #db: AbstractLevel<any, string, Session>;

  constructor(db: AbstractLevel<any, string, Session>) {
    this.#db = db;
  }

  async loadSessions(): Promise<Session[]> {
    return await this.#db.values().all();
  }

  async saveSession(session: Session): Promise<void> {
    await this.#db.put(session.sessionId, session);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.#db.del(sessionId);
  }
}
