import { LocalDate } from "./domain/LocalDate.ts";

export function list(participants: readonly string[]): string {
  if (participants.length === 0) {
    return "";
  }

  if (participants.length === 1) {
    return participants[0];
  }

  const head = [...participants];
  const tail = head.pop()!;
  return head.join(", ") + " and " + tail;
}

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function parseOptionalInt(
  value: string | undefined,
): number | undefined {
  if (!value) return undefined;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? undefined : parsed;
}

const formatter = new Intl.DateTimeFormat([], {
  hour: "numeric",
  timeZone: "Europe/Amsterdam",
});

export function getHourInAmsterdam(date: Date): number {
  const parts = formatter.formatToParts(date);
  for (const part of parts) {
    if (part.type === "hour") {
      return parseInt(part.value, 10);
    }
  }
  return 0;
}

export function isOneDayAfterLastSessionOfTheMonth(date: LocalDate): boolean {
  const dayBefore = date.yesterday();
  if (!isBootcampDay(dayBefore)) {
    return false;
  }

  for (let d = date; d.month === dayBefore.month; d = d.tomorrow()) {
    if (isBootcampDay(d)) {
      return false;
    }
  }

  return true;
}

export function isBootcampDay(date: LocalDate): boolean {
  return date.weekday === LocalDate.MONDAY ||
    date.weekday === LocalDate.TUESDAY || date.weekday === LocalDate.THURSDAY;
}
