import { AbstractLevel } from "abstract-level";
import { ScheduleRepository } from "../../application/ScheduleRepository.ts";
import { Schedule } from "../../domain/Schedule.ts";

export class LevelScheduleRepository implements ScheduleRepository {
  readonly #db: AbstractLevel<any, string, Schedule>;

  constructor(db: AbstractLevel<any, string, Schedule>) {
    this.#db = db;
  }

  async loadAllSchedules(): Promise<Schedule[]> {
    const schedules: Schedule[] = [];
    for await (const value of this.#db.values()) {
      schedules.push(value);
    }
    return schedules;
  }

  async loadScheduleByUser(user: string): Promise<Schedule | undefined> {
    try {
      return await this.#db.get(user);
    } catch (error) {
      if (error.notFound) {
        return undefined;
      }
      throw error;
    }
  }

  async saveSchedule(schedule: Schedule): Promise<void> {
    await this.#db.put(schedule.user, schedule);
  }

  async deleteSchedule(user: string): Promise<void> {
    await this.#db.del(user);
  }
}
