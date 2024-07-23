import { KnownBlock, WebClient } from "@slack/web-api";
import { LeaderboardPresenter } from "../application/LeaderboardPresenter.ts";
import { Leaderboard, LeaderboardLevel } from "../domain/Leaderboard.ts";
import { LocalDate } from "../domain/LocalDate.ts";

export class SlackLeaderboardPresenter implements LeaderboardPresenter {
  readonly #webClient: WebClient;
  readonly #channel: string;

  constructor(webClient: WebClient, channel: string) {
    this.#webClient = webClient;
    this.#channel = channel;
  }

  async presentLeaderboard(leaderboard: Leaderboard): Promise<void> {
    await this.#webClient.chat.postMessage({
      blocks: this.render(leaderboard),
      channel: this.#channel,
    });
  }

  async presentLeaderboardForUser(
    leaderboard: Leaderboard,
    user: string,
    channel: string,
  ): Promise<void> {
    await this.#webClient.chat.postEphemeral({
      blocks: this.render(leaderboard),
      channel,
      user,
    });
  }

  private render(leaderboard: Leaderboard): KnownBlock[] {
    const introText = this.renderIntroText(leaderboard);
    const levelsText = this.renderLevels(leaderboard.levels);
    return [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: introText + "\n\n" + levelsText,
        },
      },
    ];
  }

  private renderLevels(
    levels: LeaderboardLevel[],
  ): string {
    let text = "";
    for (const level of levels) {
      const levelStr = this.renderLevelNumber(level.level);
      text +=
        `• ${levelStr} <@${level.participant}>: ${level.attendances} attendances\n`;
    }

    return text;
  }

  private renderLevelNumber(level: number): string {
    if (level === 1) {
      return ":first_place_medal:";
    }
    if (level === 2) {
      return ":second_place_medal:";
    }
    if (level === 3) {
      return ":third_place_medal:";
    }
    return `:medal:${level})`;
  }

  private renderIntroText(leaderboard: Leaderboard): string {
    const month = LocalDate.humanizeMonth(leaderboard.month);
    const year = leaderboard.year;
    return `*Hear is the leaderboard for ${month} ${year}* :fire:`;
  }
}
