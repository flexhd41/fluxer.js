/**
 * High-level convenience class that bundles an `ApiClient` and a `GatewayClient`
 * under a single interface — the recommended way to build a Fluxor bot.
 */

import { ApiClient } from "../api/ApiClient.js";
import { GatewayClient } from "../gateway/GatewayClient.js";
import type { FluxorConfig } from "../config.js";
import type { GatewayEvents } from "../types/gateway.js";
import type { User, Guild, Channel, CreateMessagePayload, Message } from "../types/models.js";

type EventMap = GatewayEvents & {
  raw: { event: string; data: unknown };
  close: { code: number; reason: string };
  error: Error;
  debug: string;
  HEARTBEAT_ACK: number;
};

type Listener<T> = (payload: T) => void;

export class Client {
  /** REST API client — call any Fluxor endpoint. */
  public readonly api: ApiClient;

  /** WebSocket gateway client — receives real-time events. */
  public readonly gateway: GatewayClient;

  // ── Caches ─────────────────────────────────────────────────────────────

  /** The bot's own user object, populated after READY. */
  public user: User | null = null;

  /** Guild cache keyed by guild ID — populated from READY and maintained by gateway events. */
  public readonly guilds: Map<string, Guild> = new Map();

  /** Channel cache keyed by channel ID — populated from READY and maintained by gateway events. */
  public readonly channels: Map<string, Channel> = new Map();

  /** User cache keyed by user ID — populated opportunistically from gateway events. */
  public readonly users: Map<string, User> = new Map();

  // ── Ready state ────────────────────────────────────────────────────────

  private _readyAt: Date | null = null;
  private _shutdownHandlers: (() => void)[] = [];

  constructor(token: string, config?: FluxorConfig) {
    this.api = new ApiClient(token, config);
    this.gateway = new GatewayClient(token, config);

    // ── Auto-populate caches from gateway events ──
    this.gateway.on("READY", (data) => {
      this.user = data.user ?? null;
      this._readyAt = new Date();

      if (data.user) this.users.set(data.user.id, data.user);
      if (data.guilds) {
        for (const g of data.guilds) {
          this.guilds.set(g.id, g);
          if (g.channels) {
            for (const c of g.channels) this.channels.set(c.id, c);
          }
        }
      }
      if (data.private_channels) {
        for (const c of data.private_channels) this.channels.set(c.id, c);
      }
    });

    this.gateway.on("GUILD_CREATE", (guild) => {
      this.guilds.set(guild.id, guild);
      if (guild.channels) {
        for (const c of guild.channels) this.channels.set(c.id, c);
      }
    });
    this.gateway.on("GUILD_UPDATE", (guild) => {
      this.guilds.set(guild.id, guild);
    });
    this.gateway.on("GUILD_DELETE", (data) => {
      this.guilds.delete(data.id);
    });

    this.gateway.on("CHANNEL_CREATE", (ch) => {
      this.channels.set(ch.id, ch);
    });
    this.gateway.on("CHANNEL_UPDATE", (ch) => {
      this.channels.set(ch.id, ch);
    });
    this.gateway.on("CHANNEL_DELETE", (ch) => {
      this.channels.delete(ch.id);
    });

    this.gateway.on("USER_UPDATE", (user) => {
      this.users.set(user.id, user);
      if (this.user && user.id === this.user.id) {
        this.user = user;
      }
    });
  }

  // ── Convenience getters ───────────────────────────────────────────────

  /** Whether the client has received a READY event. */
  get isReady(): boolean {
    return this._readyAt !== null;
  }

  /** Date when the client received READY, or null if not yet ready. */
  get readyAt(): Date | null {
    return this._readyAt;
  }

  /** Milliseconds since READY, or -1 if not yet ready. */
  get uptime(): number {
    return this._readyAt ? Date.now() - this._readyAt.getTime() : -1;
  }

  /** Shortcut for `this.gateway.ping`. */
  get ping(): number {
    return this.gateway.ping;
  }

  // ── Proxy event helpers to the gateway ────────────────────────────────

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.gateway.on(event as any, listener as any);
    return this;
  }

  once<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.gateway.once(event as any, listener as any);
    return this;
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): this {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.gateway.off(event as any, listener as any);
    return this;
  }

  /** Proxy for `gateway.waitFor`. */
  waitFor<K extends keyof GatewayEvents>(
    event: K,
    options?: { filter?: (data: GatewayEvents[K]) => boolean; timeout?: number },
  ): Promise<GatewayEvents[K]> {
    return this.gateway.waitFor(event, options);
  }

  // ── Convenience: send message ─────────────────────────────────────────

  /**
   * Send a message to a channel.  
   * Shorthand for `client.api.sendMessage(channelId, ...)`.
   * Accepts a `string` for quick text messages or a `CreateMessagePayload`.
   */
  async send(channelId: string, message: string | CreateMessagePayload): Promise<Message> {
    return this.api.sendMessage(channelId, message);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  /** Connect to the gateway and start receiving events. Alias for `connect()`. */
  async login(): Promise<void> {
    return this.connect();
  }

  /** Connect to the gateway and start receiving events. */
  async connect(): Promise<void> {
    return this.gateway.connect();
  }

  /** Gracefully shut down both the gateway and any in-flight requests. */
  destroy(): void {
    this._readyAt = null;
    this.user = null;
    this.guilds.clear();
    this.channels.clear();
    this.users.clear();
    this.gateway.destroy();
    this._removeShutdownHandlers();
  }

  /**
   * Register SIGINT / SIGTERM handlers that automatically call `destroy()`.
   * Call this after constructing the client if you want graceful shutdown.
   */
  enableGracefulShutdown(): this {
    const handler = () => {
      this.destroy();
      process.exit(0);
    };

    process.on("SIGINT", handler);
    process.on("SIGTERM", handler);

    this._shutdownHandlers.push(handler);
    return this;
  }

  private _removeShutdownHandlers(): void {
    for (const handler of this._shutdownHandlers) {
      process.off("SIGINT", handler);
      process.off("SIGTERM", handler);
    }
    this._shutdownHandlers = [];
  }
}
