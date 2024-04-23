const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export class LocalDate {
  static readonly SUNDAY = 0;
  static readonly MONDAY = 1;
  static readonly TUESDAY = 2;
  static readonly WEDNESDAY = 3;
  static readonly THURSDAY = 4;
  static readonly FRIDAY = 5;
  static readonly SATURDAY = 6;

  readonly year: number;
  readonly month: number;
  readonly day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  static today(): LocalDate {
    const now = new Date();
    return LocalDate.from(now);
  }

  static from(date: Date): LocalDate {
    return new LocalDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
  }

  get weekday(): number {
    return this.toDate().getDay();
  }

  isToday(): boolean {
    return this.equals(LocalDate.today());
  }

  isBefore(other: LocalDate): boolean {
    if (this.year < other.year) {
      return true;
    }
    if (this.year > other.year) {
      return false;
    }
    if (this.month < other.month) {
      return true;
    }
    if (this.month > other.month) {
      return false;
    }
    return this.day < other.day;
  }

  yesterday(): LocalDate {
    return this.addDays(-1);
  }

  tomorrow(): LocalDate {
    return this.addDays(1);
  }

  nextWeekday(weekday: number): LocalDate {
    if (weekday === this.weekday) {
      return this.addDays(7);
    }
    const daysUntilWeekday = (weekday - this.weekday + 7) % 7;
    return this.addDays(daysUntilWeekday);
  }

  addDays(days: number): LocalDate {
    const date = this.toDate();
    date.setDate(date.getDate() + days);
    return new LocalDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    );
  }

  toDate(): Date {
    return new Date(this.year, this.month - 1, this.day);
  }

  toJSON(): string {
    return this.toString();
  }

  toHuman(): string {
    const weekdayString = WEEKDAYS[this.weekday];
    const monthString = MONTHS[this.month - 1];
    const ord = (n: number): string => {
      if (n === 1 || n === 21 || n === 31) {
        return "st";
      }
      if (n === 2 || n === 22) {
        return "nd";
      }
      if (n === 3 || n === 23) {
        return "rd";
      }
      return "th";
    };
    return `${weekdayString}, ${this.day}${
      ord(this.day)
    } ${monthString} ${this.year}`;
  }

  toString(): string {
    const month = this.month.toString().padStart(2, "0");
    const day = this.day.toString().padStart(2, "0");
    return `${this.year}-${month}-${day}`;
  }

  equals(other: LocalDate): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }

  static parse(value: string): LocalDate {
    if (value.length === 10) {
      const year = parseInt(value.slice(0, 4), 10);
      const month = parseInt(value.slice(5, 7), 10);
      const day = parseInt(value.slice(8, 10), 10);
      if (
        Number.isInteger(year) &&
        Number.isInteger(month) &&
        Number.isInteger(day)
      ) {
        if (month >= 1 && month <= 12) {
          if (day >= 1 && day <= 31) {
            return new LocalDate(year, month, day);
          }
        }
      }
    }

    throw new TypeError("Not a LocalDate: " + value);
  }
}
