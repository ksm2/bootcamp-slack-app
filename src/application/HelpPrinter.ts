export interface HelpPrinter {
  printHelp(user: string, channel: string): Promise<void>;
}
