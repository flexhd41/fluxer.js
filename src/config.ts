import type { Logger } from "./util/logger.js";
import type { GatewayEvents } from "./types/gateway.js";

/**
 * Presence status values accepted by the gateway IDENTIFY payload.
 */
export type StatusType = "online" | "idle" | "dnd" | "invisible" | "offline";

/**
 * Presence object sent in the IDENTIFY payload.
 */
export interface PresenceData {
  status: StatusType;
  /** Optional: activities list (platform-specific). */
  activities?: unknown[];
  /** Whether the client is AFK. */
  afk?: boolean;
  /** Unix timestamp (ms) of when the client went idle, or null. */
  since?: number | null;
}

/**
 * Configuration options for the Fluxor client.
 */
export interface FluxorConfig {
  // ── REST ──────────────────────────────────────────────
  /** Base URL for REST API requests (no trailing slash). Defaults to the production Fluxor API. */
  apiBaseUrl?: string;

  /** API version path segment (e.g. "v1"). Currently unused — reserved for future versioning. */
  apiVersion?: string;

  /** Timeout in ms for each REST API request. Default: 15 000 ms. */
  requestTimeout?: number;

  // ── Gateway ───────────────────────────────────────────
  /** WebSocket URL for the gateway. Defaults to the production Fluxor gateway. */
  gatewayUrl?: string;

  /** Seconds to wait before reconnect attempts (base; actual uses exponential backoff). */
  reconnectDelay?: number;

  /** Maximum number of reconnect attempts before giving up. Default: Infinity. */
  maxReconnectAttempts?: number;

  /** Gateway event names to filter out (never dispatched to your handlers). */
  ignoredGatewayEvents?: (keyof GatewayEvents)[];

  /** Initial presence sent in the IDENTIFY payload. */
  presence?: PresenceData;

  // ── Rate limiting ─────────────────────────────────────
  /** Enable client-side rate limiting. Default: `true`. */
  enableRateLimiting?: boolean;

  // ── Logging ───────────────────────────────────────────
  /** Logger instance. If omitted a silent no-op logger is used. */
  logger?: Logger;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

export const DEFAULT_API_BASE_URL = "https://api.fluxer.app/v1";
export const DEFAULT_GATEWAY_URL = "wss://gateway.fluxer.app/?v=1&encoding=json";
export const DEFAULT_RECONNECT_DELAY = 2;
export const DEFAULT_REQUEST_TIMEOUT = 15_000;
export const DEFAULT_MAX_RECONNECT_ATTEMPTS = Infinity;

/** Merges user config with sensible defaults. */
export function resolveConfig(cfg?: FluxorConfig): Required<
  Pick<
    FluxorConfig,
    | "apiBaseUrl"
    | "gatewayUrl"
    | "reconnectDelay"
    | "enableRateLimiting"
    | "requestTimeout"
    | "maxReconnectAttempts"
  >
> &
  FluxorConfig {
  return {
    ...cfg,
    apiBaseUrl: cfg?.apiBaseUrl ?? DEFAULT_API_BASE_URL,
    gatewayUrl: cfg?.gatewayUrl ?? DEFAULT_GATEWAY_URL,
    reconnectDelay: cfg?.reconnectDelay ?? DEFAULT_RECONNECT_DELAY,
    enableRateLimiting: cfg?.enableRateLimiting ?? true,
    requestTimeout: cfg?.requestTimeout ?? DEFAULT_REQUEST_TIMEOUT,
    maxReconnectAttempts: cfg?.maxReconnectAttempts ?? DEFAULT_MAX_RECONNECT_ATTEMPTS,
  };
}
