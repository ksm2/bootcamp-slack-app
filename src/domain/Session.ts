import { LocalDate } from "./LocalDate.js";

export interface Session {
  sessionId: string;
  date: LocalDate;
  participants: string[];
  ts?: string;
}
