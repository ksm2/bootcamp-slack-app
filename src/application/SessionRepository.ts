import { Session } from "../domain/Session.ts";

export interface SessionRepository {
  loadSessions(): Promise<Session[]>;
  saveSession(session: Session): Promise<void>;
  deleteSession(sessionId: string): Promise<void>;
}
