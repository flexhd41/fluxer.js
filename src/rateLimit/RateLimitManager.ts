/**
 * Manages rate-limit buckets — mirrors Fluxer.Net/RateLimiting/RateLimitManager.
 */
import { RateLimitBucket } from "./RateLimitBucket.js";
import type { RateLimitConfig } from "./RateLimitConfig.js";
import type { Logger } from "../util/logger.js";
import { noopLogger } from "../util/logger.js";

export interface BucketParams {
  channelId?: string;
  guildId?: string;
  userId?: string;
  targetId?: string;
  webhookId?: string;
  inviteCode?: string;
}

export class RateLimitManager {
  private readonly _buckets = new Map<string, RateLimitBucket>();
  private readonly _enabled: boolean;
  private readonly _log: Logger;

  constructor(enabled = true, logger?: Logger) {
    this._enabled = enabled;
    this._log = logger ?? noopLogger;
  }

  /** Whether rate limiting is enabled. */
  get enabled(): boolean {
    return this._enabled;
  }

  /** Number of active buckets currently tracked. */
  get activeBucketCount(): number {
    return this._buckets.size;
  }

  // ── Core ────────────────────────────────────────────────────────────────

  /**
   * Get (or create) the bucket for a given route config and dynamic IDs.
   * Returns `null` when rate limiting is disabled.
   */
  getBucket(config: RateLimitConfig, params: BucketParams = {}): RateLimitBucket | null {
    if (!this._enabled) return null;

    let key = config.bucket;

    if (params.channelId && key.includes("::channel_id"))
      key = key.replace("::channel_id", `::${params.channelId}`);
    if (params.guildId && key.includes("::guild_id"))
      key = key.replace("::guild_id", `::${params.guildId}`);
    if (params.userId && key.includes("::user_id"))
      key = key.replace("::user_id", `::${params.userId}`);
    if (params.targetId && key.includes("::target_id"))
      key = key.replace("::target_id", `::${params.targetId}`);
    if (params.webhookId && key.includes("::webhook_id"))
      key = key.replace("::webhook_id", `::${params.webhookId}`);
    if (params.inviteCode && key.includes("::invite_code"))
      key = key.replace("::invite_code", `::${params.inviteCode}`);

    let bucket = this._buckets.get(key);
    if (!bucket) {
      bucket = new RateLimitBucket(
        key,
        config.limit,
        config.windowMs,
        config.exemptFromGlobal,
      );
      this._buckets.set(key, bucket);
    }
    return bucket;
  }

  /**
   * Wait until a request can proceed, respecting the given bucket.
   * No-op when rate limiting is disabled or bucket is null.
   */
  async waitForRateLimit(bucket: RateLimitBucket | null): Promise<void> {
    if (!this._enabled || !bucket) return;

    let waitMs = await bucket.acquire();
    if (waitMs > 0) {
      this._log.warn(
        `Rate limit hit for bucket ${bucket.bucketKey}. Waiting ${waitMs}ms before retry.`,
      );
      await sleep(waitMs);

      // Retry once more after the wait.
      waitMs = await bucket.acquire();
      if (waitMs > 0) {
        this._log.warn(
          `Rate limit still active for bucket ${bucket.bucketKey}. Waiting additional ${waitMs}ms.`,
        );
        await sleep(waitMs);
      }
    }
  }

  /** Get remaining capacity and reset time for a bucket. */
  async getBucketInfo(bucket: RateLimitBucket | null): Promise<{ remaining: number; resetMs: number }> {
    if (!this._enabled || !bucket) return { remaining: Infinity, resetMs: 0 };
    const remaining = await bucket.getRemaining();
    const resetMs = await bucket.getResetTime();
    return { remaining, resetMs };
  }

  /** Reset all buckets. */
  async clearAll(): Promise<void> {
    for (const bucket of this._buckets.values()) {
      await bucket.reset();
    }
    this._buckets.clear();
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
