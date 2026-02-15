/**
 * Typed payloads for every gateway dispatch event.
 * Property names use snake_case to match the JSON sent by the Fluxor gateway.
 */
import type {
  User,
  Channel,
  Guild,
  GuildMember,
  GuildRole,
  GuildEmoji,
  GuildSticker,
  Message,
  Attachment,
  Invite,
  Webhook,
  VoiceState,
  Relationship,
  FavoriteMeme,
  CallInfo,
  ReadState,
  UserSettings,
  UserNote,
  SavedMessage,
  AuthSession,
  GuildChannelOverride,
  MessageReaction,
  ReactionEmoji,
} from "./models.js";

// ── Connection lifecycle ────────────────────────────────────────────────────

export interface ReadyEventData {
  user: User;
  guilds: Guild[];
  session_id: string;
  private_channels?: Channel[];
  relationships?: Relationship[];
  read_state?: ReadState[];
  user_settings?: UserSettings;
  [key: string]: unknown;
}

export interface SessionsReplaceEventData {
  sessions: AuthSession[];
  [key: string]: unknown;
}

// ── Message events ──────────────────────────────────────────────────────────

export interface MessageEventData {
  id: string;
  channel_id: string;
  guild_id?: string;
  author?: User;
  content?: string;
  timestamp?: string;
  edited_timestamp?: string | null;
  tts?: boolean;
  mention_everyone?: boolean;
  mentions?: User[];
  mention_roles?: string[];
  attachments?: Attachment[];
  embeds?: unknown[];
  reactions?: MessageReaction[];
  nonce?: string | number;
  pinned?: boolean;
  webhook_id?: string;
  type?: number;
  flags?: number;
  referenced_message?: Message | null;
  stickers?: unknown[];
  [key: string]: unknown;
}

export interface EntityRemovedEventData {
  id: string;
  channel_id?: string;
  guild_id?: string;
  [key: string]: unknown;
}

export interface MessageBulkDeleteEventData {
  ids: string[];
  channel_id: string;
  guild_id?: string;
}

export interface MessageAckEventData {
  channel_id: string;
  message_id: string;
  [key: string]: unknown;
}

export interface MessageReactionEventData {
  user_id: string;
  channel_id: string;
  message_id: string;
  guild_id?: string;
  emoji: ReactionEmoji;
  [key: string]: unknown;
}

export interface MessageReactionRemoveEmojiEventData {
  channel_id: string;
  message_id: string;
  guild_id?: string;
  emoji: ReactionEmoji;
}

// ── Channel events ──────────────────────────────────────────────────────────

export interface ChannelEventData extends Channel {
  [key: string]: unknown;
}

export interface ChannelUpdateBulkEventData {
  guild_id: string;
  channels: Channel[];
}

export interface ChannelRecipientEventData {
  channel_id: string;
  user: User;
}

export interface ChannelPinsUpdateEventData {
  channel_id: string;
  guild_id?: string;
  last_pin_timestamp?: string | null;
}

export interface ChannelPinsAckEventData {
  channel_id: string;
  timestamp?: string;
}

// ── Guild events ────────────────────────────────────────────────────────────

export interface GuildEventData extends Guild {
  [key: string]: unknown;
}

export interface GuildDeleteEventData {
  id: string;
  unavailable?: boolean;
}

export interface GuildMemberEventData {
  guild_id: string;
  user?: User;
  nickname?: string | null;
  roles?: string[];
  joined_at?: string;
  [key: string]: unknown;
}

export interface GuildBanEventData {
  guild_id: string;
  user: User;
}

export interface GuildRoleEventData {
  guild_id: string;
  role: GuildRole;
}

export interface GuildRoleDeleteEventData {
  guild_id: string;
  role_id: string;
}

export interface GuildRoleUpdateBulkEventData {
  guild_id: string;
  roles: GuildRole[];
}

export interface GuildEmojisUpdateEventData {
  guild_id: string;
  emojis: GuildEmoji[];
}

export interface GuildStickersUpdateEventData {
  guild_id: string;
  stickers: GuildSticker[];
}

// ── User events ─────────────────────────────────────────────────────────────

export interface UserEventData extends User {
  [key: string]: unknown;
}

export interface UserSettingsUpdateEventData extends UserSettings {
  [key: string]: unknown;
}

export interface UserGuildSettingsUpdateEventData {
  guild_id?: string;
  channel_overrides?: GuildChannelOverride[];
  [key: string]: unknown;
}

export interface UserPinnedDmsUpdateEventData {
  [key: string]: unknown;
}

export interface UserNoteUpdateEventData {
  id: string;
  note: string;
}

export interface AuthSessionChangeEventData {
  sessions: AuthSession[];
  [key: string]: unknown;
}

// ── Presence / Typing ───────────────────────────────────────────────────────

export interface PresenceEventData {
  user: User;
  guild_id?: string;
  status?: string;
  activities?: unknown[];
  client_status?: Record<string, string>;
}

export interface TypingEventData {
  channel_id: string;
  guild_id?: string;
  user_id: string;
  timestamp: number;
}

// ── Voice ───────────────────────────────────────────────────────────────────

export interface VoiceStateEventData extends VoiceState {
  member?: GuildMember;
  [key: string]: unknown;
}

export interface VoiceServerUpdateEventData {
  guild_id: string;
  token: string;
  endpoint: string;
}

// ── Webhooks ────────────────────────────────────────────────────────────────

export interface WebhooksUpdateEventData {
  guild_id: string;
  channel_id: string;
}

// ── Relationship events ─────────────────────────────────────────────────────

export interface RelationshipEventData extends Relationship {
  [key: string]: unknown;
}

// ── Favourite Meme events ───────────────────────────────────────────────────

export interface FavoriteMemeEventData extends FavoriteMeme {
  [key: string]: unknown;
}

// ── Call events ─────────────────────────────────────────────────────────────

export interface CallEventData extends CallInfo {
  [key: string]: unknown;
}

// ── Saved Message / Recent Mention ──────────────────────────────────────────

export interface SavedMessageEventData extends SavedMessage {
  [key: string]: unknown;
}

export interface RecentMentionDeleteEventData {
  message_id: string;
  [key: string]: unknown;
}

// ── Invite events ───────────────────────────────────────────────────────────

export interface InviteCreateEventData extends Invite {
  channel_id: string;
  guild_id?: string;
  [key: string]: unknown;
}

export interface InviteDeleteEventData {
  channel_id: string;
  guild_id?: string;
  code: string;
}

// ── Aggregate event map (useful for typed event emitters) ───────────────────

export interface GatewayEvents {
  READY: ReadyEventData;
  RESUMED: undefined;
  SESSIONS_REPLACE: SessionsReplaceEventData;

  // Messages
  MESSAGE_CREATE: MessageEventData;
  MESSAGE_UPDATE: MessageEventData;
  MESSAGE_DELETE: EntityRemovedEventData;
  MESSAGE_DELETE_BULK: MessageBulkDeleteEventData;
  MESSAGE_ACK: MessageAckEventData;
  MESSAGE_REACTION_ADD: MessageReactionEventData;
  MESSAGE_REACTION_REMOVE: MessageReactionEventData;
  MESSAGE_REACTION_REMOVE_ALL: EntityRemovedEventData;
  MESSAGE_REACTION_REMOVE_EMOJI: MessageReactionRemoveEmojiEventData;

  // Channels
  CHANNEL_CREATE: ChannelEventData;
  CHANNEL_UPDATE: ChannelEventData;
  CHANNEL_DELETE: ChannelEventData;
  CHANNEL_UPDATE_BULK: ChannelUpdateBulkEventData;
  CHANNEL_RECIPIENT_ADD: ChannelRecipientEventData;
  CHANNEL_RECIPIENT_REMOVE: ChannelRecipientEventData;
  CHANNEL_PINS_UPDATE: ChannelPinsUpdateEventData;
  CHANNEL_PINS_ACK: ChannelPinsAckEventData;

  // Guild
  GUILD_CREATE: GuildEventData;
  GUILD_UPDATE: GuildEventData;
  GUILD_DELETE: GuildDeleteEventData;
  GUILD_MEMBER_ADD: GuildMemberEventData;
  GUILD_MEMBER_UPDATE: GuildMemberEventData;
  GUILD_MEMBER_REMOVE: EntityRemovedEventData;
  GUILD_BAN_ADD: GuildBanEventData;
  GUILD_BAN_REMOVE: GuildBanEventData;
  GUILD_ROLE_CREATE: GuildRoleEventData;
  GUILD_ROLE_UPDATE: GuildRoleEventData;
  GUILD_ROLE_DELETE: GuildRoleDeleteEventData;
  GUILD_ROLE_UPDATE_BULK: GuildRoleUpdateBulkEventData;
  GUILD_EMOJIS_UPDATE: GuildEmojisUpdateEventData;
  GUILD_STICKERS_UPDATE: GuildStickersUpdateEventData;

  // User
  USER_UPDATE: UserEventData;
  USER_SETTINGS_UPDATE: UserSettingsUpdateEventData;
  USER_GUILD_SETTINGS_UPDATE: UserGuildSettingsUpdateEventData;
  USER_PINNED_DMS_UPDATE: UserPinnedDmsUpdateEventData;
  USER_NOTE_UPDATE: UserNoteUpdateEventData;
  AUTH_SESSION_CHANGE: AuthSessionChangeEventData;

  // Presence / Typing
  PRESENCE_UPDATE: PresenceEventData;
  TYPING_START: TypingEventData;
  TYPING_STOP: TypingEventData;

  // Voice
  VOICE_STATE_UPDATE: VoiceStateEventData;
  VOICE_SERVER_UPDATE: VoiceServerUpdateEventData;

  // Webhooks
  WEBHOOKS_UPDATE: WebhooksUpdateEventData;

  // Relationships
  RELATIONSHIP_ADD: RelationshipEventData;
  RELATIONSHIP_UPDATE: RelationshipEventData;
  RELATIONSHIP_REMOVE: RelationshipEventData;

  // Favourite Memes
  FAVORITE_MEME_CREATE: FavoriteMemeEventData;
  FAVORITE_MEME_UPDATE: FavoriteMemeEventData;
  FAVORITE_MEME_DELETE: FavoriteMemeEventData;

  // Calls
  CALL_CREATE: CallEventData;
  CALL_UPDATE: CallEventData;
  CALL_DELETE: CallEventData;

  // Saved messages / recent mentions
  SAVED_MESSAGE_CREATE: SavedMessageEventData;
  SAVED_MESSAGE_DELETE: SavedMessageEventData;
  RECENT_MENTION_DELETE: RecentMentionDeleteEventData;

  // Invites
  INVITE_CREATE: InviteCreateEventData;
  INVITE_DELETE: InviteDeleteEventData;
}
