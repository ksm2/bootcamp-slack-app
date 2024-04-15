export class LocalDate {
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

  toJSON(): string {
    return this.toString();
  }

  toString(): string {
    return `${this.year}-${this.month.toString().padStart(2, "0")}-${this.day.toString().padStart(2, "0")}`;
  }

  private equals(other: LocalDate): boolean {
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
}
