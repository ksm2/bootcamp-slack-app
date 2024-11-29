import { WebClient } from "@slack/web-api";
import { HelpPrinter } from "../application/HelpPrinter.ts";
import { Logger } from "../application/Logger.ts";

const PAR = "\n\n";

export class SlackHelpPrinter implements HelpPrinter {
  readonly #webClient: WebClient;
  readonly #logger: Logger;

  constructor(webClient: WebClient, logger: Logger) {
    this.#webClient = webClient;
    this.#logger = logger;
  }

  async printHelp(user: string, channel: string): Promise<void> {
    await this.printInfo(
      user,
      channel,
      "*Here's how to use the Bootcamp Bot*" + PAR +
        "To join the next session:" +
        "```/bootcamp join```" + PAR +
        "To remove yourself from the next session:" +
        "```/bootcamp quit```" + PAR +
        "You can also specify a date to join or quit a session. Here are a few examples:" +
        "```/bootcamp join thursday\n/bootcamp quit tomorrow\n/bootcamp join monday\n/bootcamp quit tuesday```" +
        PAR +
        "Further, you can setup a *schedule*. Here are a few examples:" +
        "```/bootcamp join every thursday\n/bootcamp quit every monday```" +
        PAR +
        "If you want to see the current leaderboard use the following command:" +
        "```/bootcamp leaderboard```",
    );
  }

  async printInfo(
    user: string,
    channel: string,
    message: string,
  ): Promise<void> {
    try {
      await this.#webClient.chat.postEphemeral({
        text: message,
        user,
        channel,
      });
    } catch (error) {
      this.#logger.warn("Failed to print info:", error.message);
    }
  }
}
