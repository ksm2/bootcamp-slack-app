import { Level } from "level";
import { ScheduleRepository } from "../../application/ScheduleRepository.ts";
import { SessionRepository } from "../../application/SessionRepository.ts";
import { LocalDate } from "../../domain/LocalDate.ts";
import { Schedule } from "../../domain/Schedule.ts";
import { Session } from "../../domain/Session.ts";
import { LevelScheduleRepository } from "./LevelScheduleRepository.ts";
import { LevelSessionRepository } from "./LevelSessionRepository.ts";

export class LevelModule {
  readonly sessionRepository: SessionRepository;
  readonly scheduleRepository: ScheduleRepository;

  constructor(dbLocation: string) {
    const db = new Level(dbLocation);

    const sessions = db.sublevel<string, Session>("sessions", {
      valueEncoding: {
        name: "session",
        format: "utf8",
        encode: (data: Session): string => JSON.stringify(data),
        decode: (data: string): Session =>
          JSON.parse(data, (key, value) => {
            if (key === "date") {
              return LocalDate.parse(value);
            } else {
              return value;
            }
          }),
      },
    });

    const schedules = db.sublevel<string, Schedule>("schedules", {
      keyEncoding: "utf8",
      valueEncoding: "json",
    });

    this.sessionRepository = new LevelSessionRepository(sessions);
    this.scheduleRepository = new LevelScheduleRepository(schedules);
  }
}
