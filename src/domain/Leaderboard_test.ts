import { assertEquals } from "@std/testing/asserts";
import { Leaderboard } from "./Leaderboard.ts";

Deno.test("Leaderboard", () => {
  const leaderboard = new Leaderboard(7, 2024);
  assertEquals(leaderboard.month, 7);
  assertEquals(leaderboard.year, 2024);
  assertEquals(leaderboard.levels, []);

  leaderboard.addAttendee("user1");
  leaderboard.addAttendee("user2");
  leaderboard.addAttendee("user3");
  assertEquals(leaderboard.levels, [
    { level: 1, participant: "user1", attendances: 1 },
    { level: 1, participant: "user2", attendances: 1 },
    { level: 1, participant: "user3", attendances: 1 },
  ]);

  leaderboard.addAttendee("user1");
  assertEquals(leaderboard.levels, [
    { level: 1, participant: "user1", attendances: 2 },
    { level: 2, participant: "user2", attendances: 1 },
    { level: 2, participant: "user3", attendances: 1 },
  ]);

  leaderboard.addAttendee("user2");
  assertEquals(leaderboard.levels, [
    { level: 1, participant: "user1", attendances: 2 },
    { level: 1, participant: "user2", attendances: 2 },
    { level: 2, participant: "user3", attendances: 1 },
  ]);

  leaderboard.addAttendee("user3");
  leaderboard.addAttendee("user3");
  assertEquals(leaderboard.levels, [
    { level: 1, participant: "user3", attendances: 3 },
    { level: 2, participant: "user1", attendances: 2 },
    { level: 2, participant: "user2", attendances: 2 },
  ]);
});
