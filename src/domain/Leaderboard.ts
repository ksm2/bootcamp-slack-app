export class Leaderboard {
  readonly month: number;
  readonly year: number;
  readonly levels: LeaderboardLevel[];

  constructor(month: number, year: number) {
    this.month = month;
    this.year = year;
    this.levels = [];
  }

  addAttendee(participant: string): void {
    const level = this.levels.find((l) => l.participant === participant);
    if (level) {
      level.attendances++;
    } else {
      this.levels.push({
        level: 0,
        participant,
        attendances: 1,
      });
    }
    this.resort();
    this.updateLevels();
  }

  private resort() {
    this.levels.sort((a, b) => b.attendances - a.attendances);
  }

  private updateLevels() {
    let level = 0;
    let lastAttendances = 0;
    let numberOfParticipants = 1;
    for (const l of this.levels) {
      if (l.attendances !== lastAttendances) {
        level += 1;
        numberOfParticipants = 0;
        lastAttendances = l.attendances;
      }
      l.level = level;
      numberOfParticipants++;
    }
  }
}

export interface LeaderboardLevel {
  level: number;
  participant: string;
  attendances: number;
}
