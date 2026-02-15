/**
 * All enum / constant types — ported from Fluxer.Net/Data/Enums.
 * Used in model interfaces for type-safe discriminated fields.
 */

// ── Status ──────────────────────────────────────────────────────────────────

export enum Status {
  Online = 0,
  Dnd = 1,
  Idle = 2,
  Invisible = 3,
}

// ── Channel ─────────────────────────────────────────────────────────────────

export enum ChannelType {
  GuildText = 0,
  Dm = 1,
  GuildVoice = 2,
  GroupDm = 3,
  GuildCategory = 4,
  GuildNews = 5,
  GuildStore = 6,
  NewsThread = 10,
  PublicThread = 11,
  PrivateThread = 12,
  GuildStageVoice = 13,
  GuildDirectory = 14,
  GuildForum = 15,
  GuildMedia = 16,
  /** Fluxer-specific link channel type. */
  GuildLink = 998,
  /** Fluxer-specific personal notes DM type. */
  DmPersonalNotes = 999,
}

// ── Message ─────────────────────────────────────────────────────────────────

export enum MessageType {
  Default = 0,
  RecipientAdd = 1,
  RecipientRemove = 2,
  Call = 3,
  ChannelNameChange = 4,
  ChannelIconChange = 5,
  ChannelPinnedMessage = 6,
  UserJoin = 7,
  Reply = 19,
}

export enum MessageReferenceType {
  Default = 0,
  Forward = 1,
}

export enum MessageFlags {
  None = 0,
  SuppressEmbeds = 1 << 2,
  SuppressNotifications = 1 << 12,
}

export enum MessageAttachmentFlags {
  None = 0,
  IsSpoiler = 1 << 3,
  ContainsExplicitMedia = 1 << 4,
  IsAnimated = 1 << 5,
}

// ── Permissions (bigint-style, but stored as number for bits ≤ 52) ──────────

export const Permissions = {
  None: 0n,
  CreateInstantInvite: 1n << 0n,
  KickMembers: 1n << 1n,
  BanMembers: 1n << 2n,
  Administrator: 1n << 3n,
  ManageChannels: 1n << 4n,
  ManageGuild: 1n << 5n,
  AddReactions: 1n << 6n,
  ViewAuditLog: 1n << 7n,
  PrioritySpeaker: 1n << 8n,
  Stream: 1n << 9n,
  ViewChannel: 1n << 10n,
  SendMessages: 1n << 11n,
  SendTtsMessages: 1n << 12n,
  ManageMessages: 1n << 13n,
  EmbedLinks: 1n << 14n,
  AttachFiles: 1n << 15n,
  ReadMessageHistory: 1n << 16n,
  MentionEveryone: 1n << 17n,
  UseExternalEmojis: 1n << 18n,
  ViewGuildInsights: 1n << 19n,
  Connect: 1n << 20n,
  Speak: 1n << 21n,
  MuteMembers: 1n << 22n,
  DeafenMembers: 1n << 23n,
  MoveMembers: 1n << 24n,
  UseVad: 1n << 25n,
  ChangeNickname: 1n << 26n,
  ManageNicknames: 1n << 27n,
  ManageRoles: 1n << 28n,
  ManageWebhooks: 1n << 29n,
  ManageExpressions: 1n << 30n,
  UseApplicationCommands: 1n << 31n,
  RequestToSpeak: 1n << 32n,
  ManageEvents: 1n << 33n,
  ManageThreads: 1n << 34n,
  CreatePublicThreads: 1n << 35n,
  CreatePrivateThreads: 1n << 36n,
  UseExternalStickers: 1n << 37n,
  SendMessagesInThreads: 1n << 38n,
  UseEmbeddedActivities: 1n << 39n,
  ModerateMembers: 1n << 40n,
  ViewCreatorMonetizationAnalytics: 1n << 41n,
  UseSoundboard: 1n << 42n,
  CreateExpressions: 1n << 43n,
  CreateEvents: 1n << 44n,
  UseExternalSounds: 1n << 45n,
  SendVoiceMessages: 1n << 46n,
  // bit 47 skipped
  SetVoiceChannelStatus: 1n << 48n,
  SendPolls: 1n << 49n,
  UseExternalApps: 1n << 50n,
  PinMessages: 1n << 51n,
  BypassSlowmode: 1n << 52n,
  UpdateRtcRegion: 1n << 53n,
} as const;

export type PermissionsBitfield = bigint;

/** Check if a permission bitfield has a specific flag. */
export function hasPermission(bitfield: bigint, flag: bigint): boolean {
  return (bitfield & flag) === flag;
}

// ── User Flags ──────────────────────────────────────────────────────────────

export const UserFlags = {
  None: 0n,
  Staff: 1n << 0n,
  CtpMember: 1n << 1n,
  Partner: 1n << 2n,
  BugHunter: 1n << 3n,
  HighGlobalRateLimit: 1n << 33n,
  Deleted: 1n << 34n,
  DisabledSuspiciousActivity: 1n << 35n,
  SelfDeleted: 1n << 36n,
  PremiumDiscriminator: 1n << 37n,
  Disabled: 1n << 38n,
  HasSessionStarted: 1n << 39n,
  PremiumBadgeHidden: 1n << 40n,
  PremiumBadgeMasked: 1n << 41n,
  PremiumBadgeTimestampHidden: 1n << 42n,
  PremiumBadgeSequenceHidden: 1n << 43n,
  PremiumPerksSanitized: 1n << 44n,
  PremiumPurchaseDisabled: 1n << 45n,
  PremiumEnabledOverride: 1n << 46n,
  RateLimitBypass: 1n << 47n,
  ReportBanned: 1n << 48n,
  VerifiedNotUnderage: 1n << 49n,
  PendingManualVerification: 1n << 50n,
  HasDismissedPremiumOnboarding: 1n << 51n,
} as const;

// ── Relationship ────────────────────────────────────────────────────────────

export enum RelationshipType {
  Friend = 1,
  Blocked = 2,
  IncomingRequest = 3,
  OutgoingRequest = 4,
}

// ── Premium ─────────────────────────────────────────────────────────────────

export enum PremiumType {
  None = 0,
  Subscription = 1,
  Lifetime = 2,
}

// ── Invite ──────────────────────────────────────────────────────────────────

export enum InviteType {
  Guild = 0,
  GroupDm = 1,
}

// ── Guild ───────────────────────────────────────────────────────────────────

export enum GuildVerificationLevel {
  None = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  VeryHigh = 4,
}

export enum GuildMfaLevel {
  None = 0,
  Elevated = 1,
}

export enum GuildExplicitContentFilterType {
  Disabled = 0,
  MembersWithoutRoles = 1,
  AllMembers = 2,
}

export enum UserExplicitContentFilterType {
  Disabled = 0,
  NonFriends = 1,
  FriendsAndNonFriends = 2,
}

export enum NSFWFilterLevelType {
  Disabled = 0,
  NonFriends = 1,
  FriendsAndNonFriends = 2,
}

// ── Sticker ─────────────────────────────────────────────────────────────────

export enum StickerFormatType {
  Png = 1,
  Apng = 2,
  Lottie = 3,
  Gif = 4,
}

// ── Flag enums ──────────────────────────────────────────────────────────────

export enum FriendSourceFlags {
  None = 0,
  MutualFriends = 1 << 0,
  MutualGuilds = 1 << 1,
  NoRelation = 1 << 2,
}

export enum SystemChannelFlags {
  None = 0,
  SuppressJoinNotifications = 1 << 0,
}

// ── Context type (for command preconditions) ────────────────────────────────

export enum ContextType {
  Guild = 1,
  DM = 2,
  Group = 4,
}

// ── Command error ───────────────────────────────────────────────────────────

export enum CommandError {
  ParseFailed = "PARSE_FAILED",
  UnknownCommand = "UNKNOWN_COMMAND",
  BadArgCount = "BAD_ARG_COUNT",
  UnmetPrecondition = "UNMET_PRECONDITION",
  Exception = "EXCEPTION",
  Unsuccessful = "UNSUCCESSFUL",
}

export enum RunMode {
  Sync = 0,
  Async = 1,
}
