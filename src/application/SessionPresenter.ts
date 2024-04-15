import { Session } from "../domain/Session.js";

export interface SessionPresenter {
  presentSession(session: Session): Promise<void>;
}
