import { Schedule } from "../domain/Schedule.ts";

export interface ScheduleRepository {
  loadAllSchedules(): Promise<Schedule[]>;
  loadScheduleByUser(user: string): Promise<Schedule | undefined>;
  saveSchedule(schedule: Schedule): Promise<void>;
  deleteSchedule(user: string): Promise<void>;
}
