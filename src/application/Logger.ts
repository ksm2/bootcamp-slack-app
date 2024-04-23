import { Logger as ILogger, LogLevel } from "@slack/socket-mode";
import {
  bgRed,
  bgYellow,
  black,
  brightBlue,
  brightGreen,
  gray,
  white,
} from "@std/fmt/colors";

export class Logger implements ILogger {
  #name: string;
  #level: LogLevel;

  constructor(name: string = "", logLevel: LogLevel = LogLevel.DEBUG) {
    this.#name = name;
    this.#level = logLevel;
  }

  setName(name: string) {
    this.#name = name;
  }

  getLevel(): LogLevel {
    return this.#level;
  }

  setLevel(level: LogLevel) {
    this.#level = level;
  }

  debug(...msgs: unknown[]) {
    if (this.#level === LogLevel.DEBUG) {
      this.#log(brightBlue("[DEBG]"), ...msgs);
    }
  }

  info(...msgs: unknown[]) {
    if (this.#level === LogLevel.DEBUG || this.#level === LogLevel.INFO) {
      this.#log(brightGreen("[INFO]"), ...msgs);
    }
  }

  warn(...msgs: unknown[]) {
    this.#log(bgYellow(black("[WARN]")), ...msgs);
  }

  error(...msgs: unknown[]) {
    this.#log(bgRed(white("[ERR ]")), ...msgs);
  }

  #log(prefix: string, ...msgs: unknown[]) {
    const time = gray(new Date().toTimeString().slice(0, 8));
    console.log(`${time} ${prefix} ${this.#name}: ${msgs}`);
  }
}
