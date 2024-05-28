import { EventEmitter } from "@denosaurs/event";

export class Countdown extends EventEmitter<{ countdown: [] }> {
  readonly #time: number;
  #timeout?: number;

  constructor(timeInMillis: number) {
    super();
    this.#time = timeInMillis;
  }

  reset() {
    this.stop();
    this.start();
  }

  start() {
    this.#timeout = setTimeout(() => this.emit("countdown"), this.#time);
  }

  stop() {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
      this.#timeout = undefined;
    }
  }
}
