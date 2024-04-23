import { Session } from "../domain/Session.ts";

export interface SessionPresenter {
  presentSession(session: Session): Promise<void>;
}
