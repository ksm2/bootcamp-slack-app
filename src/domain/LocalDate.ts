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
    return new LocalDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  get weekday(): number {
    return this.toDate().getDay();
  }

  isToday(): boolean {
    return this.equals(LocalDate.today());
  }

  yesterday(): LocalDate {
    if (this.day > 1) {
      return new LocalDate(this.year, this.month, this.day - 1);
    }
    if (this.month > 1) {
      return new LocalDate(
        this.year,
        this.month - 1,
        LocalDate.lastOfMonth(this.month - 1),
      );
    }
    return new LocalDate(this.year - 1, 12, 31);
  }

  tomorrow(): LocalDate {
    if (this.day >= LocalDate.lastOfMonth(this.month - 1)) {
      if (this.month >= 12) {
        return new LocalDate(this.year + 1, 1, 1);
      }
      return new LocalDate(this.year, this.month + 1, 1);
    }
    return new LocalDate(this.year, this.month, this.day + 1);
  }

  toDate(): Date {
    return new Date(this.year, this.month - 1, this.day);
  }

  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.day.toString().padStart(2, "0")}`;
  }

  equals(other: LocalDate): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }

  private static lastOfMonth(month: number): number {
    const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return DAYS_IN_MONTH[month - 1];
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
