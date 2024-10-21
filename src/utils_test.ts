import { assert } from "@std/testing/asserts";
import { LocalDate } from "./domain/LocalDate.ts";
import { isBootcampDay, isOneDayAfterLastSessionOfTheMonth } from "./utils.ts";

Deno.test("isBootcampDay", () => {
  assert(isBootcampDay(new LocalDate(2024, 10, 21)));
  assert(isBootcampDay(new LocalDate(2024, 10, 22)));
  assert(isBootcampDay(new LocalDate(2024, 10, 23)));
  assert(isBootcampDay(new LocalDate(2024, 10, 24)));
  assert(!isBootcampDay(new LocalDate(2024, 10, 25)));
  assert(!isBootcampDay(new LocalDate(2024, 10, 26)));
  assert(!isBootcampDay(new LocalDate(2024, 10, 27)));
});

Deno.test("isOneDayAfterLastSessionOfTheMonth", () => {
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2023, 12, 29)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 2, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 3, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 3, 29)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 5, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 5, 31)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 6, 28)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 8, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 8, 30)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 10, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 11, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 11, 29)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2025, 1, 1)));
});
