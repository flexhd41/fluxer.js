/**
 * Sliding-window rate-limit bucket.
 *
 * Tracks timestamps of recent requests inside a rolling window and blocks when
 * the limit is reached.  Thread-safety is handled via an async queue so only
 * one caller at a time mutates state (important in Node's single-threaded
 * event loop when multiple async callers race).
 */

export class RateLimitBucket {
  public readonly bucketKey: string;
  public readonly limit: number;
  public readonly windowMs: number;
  public readonly exemptFromGlobal: boolean;

  /** Timestamps (ms) of requests inside the current window. */
  private readonly _timestamps: number[] = [];
  private _queuePromise: Promise<void> = Promise.resolve();

  constructor(
    bucketKey: string,
    limit: number,
    windowMs: number,
    exemptFromGlobal = false,
  ) {
    this.bucketKey = bucketKey;
    this.limit = limit;
    this.windowMs = windowMs;
    this.exemptFromGlobal = exemptFromGlobal;
  }

  // ── public API ──────────────────────────────────────────────────────────

  /**
   * Attempts to acquire a slot.
   *
   * @returns The number of milliseconds the caller should wait before
   *          retrying.  `0` means the slot was acquired immediately.
   */
  async acquire(): Promise<number> {
    return this._enqueue(() => this._tryAcquire());
  }

  /** How many requests can still be made inside the current window. */
  async getRemaining(): Promise<number> {
    return this._enqueue(() => {
      this._prune();
      return this.limit - this._timestamps.length;
    });
  }

  /** Milliseconds until the oldest entry in the window expires. */
  async getResetTime(): Promise<number> {
    return this._enqueue(() => {
      this._prune();
      if (this._timestamps.length === 0) return 0;
      const oldest = this._timestamps[0]!;
      return Math.max(0, oldest + this.windowMs - Date.now());
    });
  }

  /** Clears all tracked timestamps. */
  async reset(): Promise<void> {
    return this._enqueue(() => {
      this._timestamps.length = 0;
    });
  }

  // ── internals ───────────────────────────────────────────────────────────

  private _prune(): void {
    const cutoff = Date.now() - this.windowMs;
    while (this._timestamps.length > 0 && this._timestamps[0]! < cutoff) {
      this._timestamps.shift();
    }
  }

  private _tryAcquire(): number {
    this._prune();
    if (this._timestamps.length < this.limit) {
      this._timestamps.push(Date.now());
      return 0; // acquired
    }
    // Window full — tell caller how long to wait.
    const oldest = this._timestamps[0]!;
    return Math.max(0, oldest + this.windowMs - Date.now());
  }

  /** Simple FIFO promise queue so mutations are serialised. */
  private _enqueue<T>(fn: () => T): Promise<T> {
    const run = this._queuePromise.then(fn);
    // We only care about sequencing, not propagating errors to the queue.
    this._queuePromise = run.then(
      () => {},
      () => {},
    );
    return run;
  }
}
