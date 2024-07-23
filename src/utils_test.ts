import { assert } from "@std/testing/asserts";
import { LocalDate } from "./domain/LocalDate.ts";
import { isBootcampDay, isOneDayAfterLastSessionOfTheMonth } from "./utils.ts";

Deno.test("isBootcampDay", () => {
  assert(isBootcampDay(new LocalDate(2024, 7, 23)));
  assert(isBootcampDay(new LocalDate(2024, 7, 30)));
  assert(!isBootcampDay(new LocalDate(2024, 7, 31)));
  assert(isBootcampDay(new LocalDate(2024, 8, 1)));
  assert(isBootcampDay(new LocalDate(2024, 10, 1)));
  assert(isBootcampDay(new LocalDate(2024, 9, 30)));
});

Deno.test("isOneDayAfterLastSessionOfTheMonth", () => {
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2023, 12, 29)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 1, 31)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 3, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 3, 29)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 5, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 5, 31)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 6, 28)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 7, 31)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 8, 30)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 10, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 11, 1)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2024, 11, 29)));
  assert(isOneDayAfterLastSessionOfTheMonth(new LocalDate(2025, 1, 1)));
});
