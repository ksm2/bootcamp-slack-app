import { assertEquals } from "@std/testing/asserts";
import { LocalDate } from "./LocalDate.ts";

Deno.test("from", () => {
  const actual = LocalDate.from(new Date(2024, 0, 1));
  assertEquals(actual, new LocalDate(2024, 1, 1));
});

Deno.test("parse", () => {
  const actual = LocalDate.parse("2024-06-01");
  assertEquals(actual, new LocalDate(2024, 6, 1));
});

Deno.test("yesterday with new year", () => {
  const actual = new LocalDate(2024, 1, 1).yesterday();
  assertEquals(actual, new LocalDate(2023, 12, 31));
});

Deno.test("yesterday with leap year", () => {
  const actual = new LocalDate(2024, 3, 1).yesterday();
  assertEquals(actual, new LocalDate(2024, 2, 29));
});

Deno.test("yesterday with non-leap year", () => {
  const actual = new LocalDate(2023, 3, 1).yesterday();
  assertEquals(actual, new LocalDate(2023, 2, 28));
});

Deno.test("tomorrow with new year", () => {
  const actual = new LocalDate(2023, 12, 31).tomorrow();
  assertEquals(actual, new LocalDate(2024, 1, 1));
});

Deno.test("next weekday with same weekday", () => {
  const mondayFirstOfApril = new LocalDate(2024, 4, 1);
  const actual = mondayFirstOfApril.nextWeekday(LocalDate.MONDAY);
  assertEquals(actual, new LocalDate(2024, 4, 8));
});

Deno.test("next weekday with different weekday", () => {
  const mondayFirstOfApril = new LocalDate(2024, 4, 1);
  const actual = mondayFirstOfApril.nextWeekday(LocalDate.FRIDAY);
  assertEquals(actual, new LocalDate(2024, 4, 5));
});
