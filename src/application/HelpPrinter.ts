export interface HelpPrinter {
  printHelp(user: string, channel: string): Promise<void>;
  printInfo(user: string, channel: string, message: string): Promise<void>;
}
