import { Leaderboard } from "../domain/Leaderboard.ts";

export interface LeaderboardPresenter {
  presentLeaderboard(leaderboard: Leaderboard): Promise<void>;
  presentLeaderboardForUser(
    leaderboard: Leaderboard,
    user: string,
    channel: string,
  ): Promise<void>;
}
