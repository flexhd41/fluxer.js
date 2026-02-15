/**
 * Context object passed to every command handler.
 * Provides access to the message, channel, guild, and the API/Gateway clients.
 */
import type { ApiClient } from "../api/ApiClient.js";
import type { GatewayClient } from "../gateway/GatewayClient.js";
import type { MessageEventData } from "../types/gateway.js";
import type { User, Message, CreateMessagePayload, Embed } from "../types/models.js";

export class CommandContext {
  /** The raw gateway message event data. */
  public readonly message: MessageEventData;

  /** The REST API client. */
  public readonly api: ApiClient;

  /** The WebSocket gateway client. */
  public readonly gateway: GatewayClient;

  /** Index where the command argument text begins in the message content. */
  public readonly argPos: number;

  constructor(
    message: MessageEventData,
    api: ApiClient,
    gateway: GatewayClient,
    argPos: number,
  ) {
    this.message = message;
    this.api = api;
    this.gateway = gateway;
    this.argPos = argPos;
  }

  // ── Convenience getters ───────────────────────────────────────────────

  /** The ID of the channel the command was sent in. */
  get channelId(): string {
    return this.message.channel_id;
  }

  /** The guild ID (undefined in DMs). */
  get guildId(): string | undefined {
    return this.message.guild_id;
  }

  /** The user who sent the command. */
  get user(): User | undefined {
    return this.message.author;
  }

  /** The raw message content. */
  get content(): string {
    return this.message.content ?? "";
  }

  /** The command argument string (everything after the prefix + command name). */
  get argString(): string {
    const afterPrefix = this.content.slice(this.argPos).trim();
    const spaceIndex = afterPrefix.indexOf(" ");
    return spaceIndex === -1 ? "" : afterPrefix.slice(spaceIndex + 1).trim();
  }

  /** The arguments split by whitespace. */
  get args(): string[] {
    const raw = this.argString;
    return raw ? raw.split(/\s+/) : [];
  }

  // ── Convenience methods ───────────────────────────────────────────────

  /** Reply to the current channel with a text message or payload. */
  async reply(message: string | CreateMessagePayload): Promise<Message> {
    const payload: CreateMessagePayload =
      typeof message === "string" ? { content: message } : message;
    return this.api.sendMessage(this.channelId, payload);
  }

  /** Reply with an embed. */
  async replyEmbed(embed: Embed): Promise<Message> {
    return this.api.sendMessage(this.channelId, { embeds: [embed] });
  }
}
