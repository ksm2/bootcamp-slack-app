import { Session } from "../domain/Session.js";

export interface SessionRepository {
  loadSessions(): Promise<Session[]>;
  saveSession(session: Session): Promise<void>;
}
