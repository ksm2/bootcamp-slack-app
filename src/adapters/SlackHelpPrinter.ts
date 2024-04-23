import { WebClient } from "@slack/web-api";
import { HelpPrinter } from "../application/HelpPrinter.ts";

const PAR = "\n\n";

export class SlackHelpPrinter implements HelpPrinter {
  readonly #webClient: WebClient;

  constructor(webClient: WebClient) {
    this.#webClient = webClient;
  }

  async printHelp(user: string, channel: string): Promise<void> {
    await this.#webClient.chat.postEphemeral({
      text: "*Here's how to use the Bootcamp Bot*" + PAR +
        "To join the next session:" +
        "```/bootcamp join```" + PAR +
        "To remove yourself from the next session:" +
        "```/bootcamp quit```" + PAR +
        "You can also specify a date to join or quit a session. Here are a few examples:" +
        "```/bootcamp join thursday\n/bootcamp quit tomorrow\n/bootcamp join monday\n/bootcamp quit tuesday```",
      user,
      channel,
    });
  }
}
