/**
 * Core data-model interfaces — mirrors Fluxer.Net/Data/Models.
 *
 * Property names use **snake_case** to match the JSON wire format used
 * by the Fluxer API.  Fields that are always present in API responses
 * are required; contextually absent fields are optional.
 *
 * Mutation payloads (`Create*Payload`, `Update*Payload`) are separate
 * types so callers get proper autocompletion.
 */
import type {
  ChannelType,
  MessageType,
  MessageFlags,
  MessageAttachmentFlags,
  RelationshipType,
  PremiumType,
  InviteType,
  GuildVerificationLevel,
  GuildMfaLevel,
  GuildExplicitContentFilterType,
  StickerFormatType,
} from "./enums.js";

// ── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  tag: string;
  email?: string;
  avatar: string | null;
  banner?: string | null;
  bio?: string | null;
  flags?: number;
  public_flags?: number;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  verified?: boolean;
  locale?: string;
  premium_type?: PremiumType;
  /** Nickname — only present in guild-member context. */
  nickname?: string;
}

export interface UserSettings {
  theme?: string;
  locale?: string;
  message_display_compact?: boolean;
  show_current_game?: boolean;
  status?: string;
  custom_status?: unknown;
  [key: string]: unknown;
}

// ── Channel ─────────────────────────────────────────────────────────────────

export interface Channel {
  id: string;
  type: ChannelType;
  guild_id?: string;
  position?: number;
  name?: string;
  topic?: string | null;
  nsfw?: boolean;
  last_message_id?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  recipients?: User[];
  icon?: string | null;
  owner_id?: string;
  parent_id?: string | null;
  last_pin_timestamp?: string | null;
  rtc_region?: string | null;
  permission_overwrites?: ChannelPermissionOverwrite[];
}

export interface ChannelPermissionOverwrite {
  id: string;
  type: number;
  allow: string;
  deny: string;
}

// ── Message ─────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  channel_id: string;
  guild_id?: string;
  author: User;
  content: string;
  timestamp: string;
  edited_timestamp: string | null;
  tts: boolean;
  mention_everyone: boolean;
  mentions: User[];
  mention_roles: string[];
  attachments: Attachment[];
  embeds: Embed[];
  reactions?: MessageReaction[];
  nonce?: string | number;
  pinned: boolean;
  webhook_id?: string;
  type: MessageType;
  flags?: MessageFlags;
  referenced_message?: Message | null;
  message_reference?: MessageRef;
  stickers?: GuildSticker[];
}

export interface MessageRef {
  message_id?: string;
  channel_id?: string;
  guild_id?: string;
}

export interface MessageAck {
  message_id: string;
  channel_id: string;
}

export interface MessageReaction {
  count: number;
  me: boolean;
  emoji: ReactionEmoji;
}

export interface ReactionEmoji {
  id: string | null;
  name: string;
  animated?: boolean;
}

// ── Attachment ──────────────────────────────────────────────────────────────

export interface Attachment {
  id: string;
  filename: string;
  content_type?: string;
  size: number;
  url: string;
  proxy_url?: string;
  height?: number | null;
  width?: number | null;
  flags?: MessageAttachmentFlags;
}

// ── Embed ───────────────────────────────────────────────────────────────────

export interface Embed {
  title?: string;
  type?: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedMedia;
  thumbnail?: EmbedMedia;
  video?: EmbedMedia;
  provider?: EmbedProvider;
  author?: EmbedAuthor;
  fields?: EmbedField[];
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
}

export interface EmbedMedia {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedProvider {
  name?: string;
  url?: string;
}

export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

// ── Guild ───────────────────────────────────────────────────────────────────

export interface Guild {
  id: string;
  name: string;
  icon: string | null;
  splash?: string | null;
  banner?: string | null;
  description?: string | null;
  owner_id: string;
  region?: string;
  afk_channel_id?: string | null;
  afk_timeout?: number;
  verification_level?: GuildVerificationLevel;
  default_message_notifications?: number;
  explicit_content_filter?: GuildExplicitContentFilterType;
  roles?: GuildRole[];
  emojis?: GuildEmoji[];
  stickers?: GuildSticker[];
  features?: string[];
  mfa_level?: GuildMfaLevel;
  system_channel_id?: string | null;
  system_channel_flags?: number;
  rules_channel_id?: string | null;
  max_members?: number;
  vanity_url_code?: string | null;
  premium_tier?: number;
  premium_subscription_count?: number;
  preferred_locale?: string;
  member_count?: number;
  channels?: Channel[];
  members?: GuildMember[];
  unavailable?: boolean;
}

// ── Guild Member ────────────────────────────────────────────────────────────

export interface GuildMember {
  user?: User;
  nickname?: string | null;
  avatar?: string | null;
  roles: string[];
  joined_at: string;
  premium_since?: string | null;
  deaf?: boolean;
  mute?: boolean;
  pending?: boolean;
  permissions?: string;
  communication_disabled_until?: string | null;
}

// ── Guild Role ──────────────────────────────────────────────────────────────

export interface GuildRole {
  id: string;
  name: string;
  color: number;
  hoist: boolean;
  position: number;
  permissions: string;
  managed: boolean;
  mentionable: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
}

// ── Guild Emoji / Sticker ───────────────────────────────────────────────────

export interface GuildEmoji {
  id: string;
  name: string;
  roles?: string[];
  require_colons?: boolean;
  managed?: boolean;
  animated?: boolean;
  available?: boolean;
}

export interface GuildSticker {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  type?: number;
  format_type?: StickerFormatType;
  guild_id?: string;
  available?: boolean;
}

// ── Invite ──────────────────────────────────────────────────────────────────

export interface Invite {
  code: string;
  guild?: Guild;
  channel?: Channel;
  inviter?: User;
  uses?: number;
  max_uses?: number;
  max_age?: number;
  temporary?: boolean;
  created_at?: string;
  expires_at?: string | null;
  type?: InviteType;
}

// ── Guild Ban ───────────────────────────────────────────────────────────────

export interface GuildBan {
  reason: string | null;
  user: User;
  created_at?: string;
}

// ── Guild Audit Log ─────────────────────────────────────────────────────────

export interface GuildAuditLog {
  id: string;
  guild_id: string;
  user_id: string;
  target_id: string | null;
  action_type: number;
  changes?: unknown[];
  reason?: string | null;
  created_at?: string;
}

// ── Auth ────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
  captcha_key?: string;
}

export interface LoginResponse {
  token?: string;
  mfa?: boolean;
  ticket?: string;
}

export interface AuthSession {
  id: string;
  client_info?: unknown;
  created_at?: string;
  last_used?: string;
  current?: boolean;
}

// ── Webhook ─────────────────────────────────────────────────────────────────

export interface Webhook {
  id: string;
  type?: number;
  guild_id?: string;
  channel_id: string;
  user?: User;
  name: string;
  avatar?: string | null;
  token?: string;
  url?: string;
}

// ── Voice ───────────────────────────────────────────────────────────────────

export interface VoiceState {
  guild_id?: string;
  channel_id: string | null;
  user_id: string;
  session_id: string;
  deaf: boolean;
  mute: boolean;
  self_deaf: boolean;
  self_mute: boolean;
  self_video?: boolean;
  suppress?: boolean;
}

export interface VoiceRegion {
  id: string;
  name: string;
  optimal: boolean;
  deprecated: boolean;
  custom: boolean;
}

// ── Call ─────────────────────────────────────────────────────────────────────

export interface CallInfo {
  channel_id: string;
  region?: string;
  ringing?: string[];
}

// ── Favourite Meme ──────────────────────────────────────────────────────────

export interface FavoriteMeme {
  id: string;
  url: string;
  type?: number;
  name?: string;
  width?: number;
  height?: number;
  created_at?: string;
}

// ── Gift / Beta Code ────────────────────────────────────────────────────────

export interface GiftCode {
  code: string;
  sku_id?: string;
  uses?: number;
  max_uses?: number;
  expires_at?: string | null;
  redeemed?: boolean;
  created_at?: string;
}

export interface BetaCode {
  code: string;
  used?: boolean;
  created_at?: string;
}

// ── Misc ────────────────────────────────────────────────────────────────────

export interface GuildChannelOverride {
  channel_id: string;
  message_notifications?: number;
  muted?: boolean;
  muted_until?: string | null;
}

export interface EmailVerificationToken {
  token: string;
  email: string;
}

export interface Relationship {
  id: string;
  user: User;
  type: RelationshipType;
  nickname?: string | null;
  since?: string;
}

export interface ReadState {
  id: string;
  channel_id: string;
  last_message_id: string;
  mention_count?: number;
}

export interface UserNote {
  user_id: string;
  note: string;
}

export interface SavedMessage {
  id: string;
  message_id: string;
  channel_id: string;
  message?: Message;
  created_at?: string;
}

// ═════════════════════════════════════════════════════════════════════════════
//  Mutation Payloads (for API create / update endpoints)
// ═════════════════════════════════════════════════════════════════════════════

export interface CreateMessagePayload {
  content?: string;
  embeds?: Embed[];
  nonce?: string | number;
  tts?: boolean;
  message_reference?: MessageRef;
  sticker_ids?: string[];
}

export interface EditMessagePayload {
  content?: string;
  embeds?: Embed[];
  flags?: number;
}

export interface CreateGuildPayload {
  name: string;
  icon?: string;
}

export interface UpdateGuildPayload {
  name?: string;
  icon?: string | null;
  splash?: string | null;
  banner?: string | null;
  description?: string | null;
  region?: string;
  afk_channel_id?: string | null;
  afk_timeout?: number;
  verification_level?: number;
  default_message_notifications?: number;
  explicit_content_filter?: number;
  system_channel_id?: string | null;
  system_channel_flags?: number;
  rules_channel_id?: string | null;
  preferred_locale?: string;
  owner_id?: string;
}

export interface CreateChannelPayload {
  name: string;
  type?: ChannelType;
  topic?: string;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  position?: number;
  permission_overwrites?: ChannelPermissionOverwrite[];
  parent_id?: string;
  nsfw?: boolean;
}

export interface UpdateChannelPayload {
  name?: string;
  topic?: string | null;
  bitrate?: number;
  user_limit?: number;
  rate_limit_per_user?: number;
  position?: number;
  permission_overwrites?: ChannelPermissionOverwrite[];
  parent_id?: string | null;
  nsfw?: boolean;
}

export interface BanMemberPayload {
  reason?: string;
  delete_message_days?: number;
}

export interface BulkDeletePayload {
  messages: string[];
}

export interface CreateInvitePayload {
  max_age?: number;
  max_uses?: number;
  temporary?: boolean;
}

export interface CreateRolePayload {
  name?: string;
  permissions?: string;
  color?: number;
  hoist?: boolean;
  mentionable?: boolean;
}

export interface UpdateRolePayload {
  name?: string;
  permissions?: string;
  color?: number;
  hoist?: boolean;
  mentionable?: boolean;
  icon?: string | null;
  unicode_emoji?: string | null;
}

export interface CreateEmojiPayload {
  name: string;
  image: string;
  roles?: string[];
}

export interface UpdateEmojiPayload {
  name?: string;
  roles?: string[];
}

export interface CreateStickerPayload {
  name: string;
  description?: string;
  tags?: string;
  file: string;
}

export interface UpdateStickerPayload {
  name?: string;
  description?: string;
  tags?: string;
}

export interface CreateWebhookPayload {
  name: string;
  avatar?: string;
}

export interface UpdateWebhookPayload {
  name?: string;
  avatar?: string | null;
  channel_id?: string;
}

export interface ExecuteWebhookPayload {
  content?: string;
  username?: string;
  avatar_url?: string;
  tts?: boolean;
  embeds?: Embed[];
}

export interface UpdateCurrentUserPayload {
  username?: string;
  avatar?: string | null;
  banner?: string | null;
  bio?: string | null;
}

export interface UpdateMemberPayload {
  nickname?: string | null;
  roles?: string[];
  mute?: boolean;
  deaf?: boolean;
  communication_disabled_until?: string | null;
}

export interface SendFriendRequestPayload {
  username: string;
  tag: string;
}

export interface CreateDmPayload {
  recipient_id?: string;
  recipients?: string[];
}

export interface ReportPayload {
  reason: string;
  guild_id?: string;
  channel_id?: string;
  message_id?: string;
  user_id?: string;
}

export interface SearchPayload {
  content?: string;
  author_id?: string;
  has?: string;
  before?: string;
  after?: string;
  offset?: number;
  limit?: number;
}

export interface AuditLogSearchPayload {
  user_id?: string;
  action_type?: number;
  before?: string;
  limit?: number;
}

export interface DeleteGuildPayload {
  password?: string;
}

export interface TransferOwnershipPayload {
  user_id: string;
}

export interface AckBulkPayload {
  read_states: { channel_id: string; message_id: string }[];
}

export interface MfaTotpPayload {
  code: string;
  password?: string;
}

export interface MfaSmsPayload {
  code: string;
}

export interface VerifyEmailPayload {
  token: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  captcha_key?: string;
}

export interface AuthorizeIpPayload {
  token: string;
}

export interface LogoutSessionsPayload {
  session_ids: string[];
  password: string;
}

export interface SaveMessagePayload {
  message_id: string;
  channel_id: string;
}

export interface SetNotePayload {
  note: string;
}

export interface UpdateCallPayload {
  region?: string;
}

export interface RingCallPayload {
  recipients: string[];
}

export interface CreateMemePayload {
  url: string;
  name?: string;
}

export interface UpdateMemePayload {
  name?: string;
}

export interface GetMessagesOptions {
  limit?: number;
  before?: string;
  after?: string;
  around?: string;
}
