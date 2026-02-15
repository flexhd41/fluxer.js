/**
 * Describes a single rate-limit configuration for a route or group of routes.
 */
export interface RateLimitConfig {
  /**
   * Bucket key template.  May contain placeholders like `::channel_id`,
   * `::guild_id`, `::user_id`, `::target_id`, `::webhook_id`, `::invite_code`
   * which are replaced with real values at request time.
   */
  bucket: string;

  /** Maximum number of requests allowed in the window. */
  limit: number;

  /** Window duration in milliseconds. */
  windowMs: number;

  /** If `true`, this bucket is not counted towards the global rate limit. */
  exemptFromGlobal?: boolean;
}
