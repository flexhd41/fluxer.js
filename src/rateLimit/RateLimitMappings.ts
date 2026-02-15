/**
 * Route-to-bucket mappings — ported from RateLimitMappings.cs / RateLimitConfig.cs.
 *
 * Each key is a logical route identifier and the value is a `RateLimitConfig`.
 * The bucket key can contain placeholders that `RateLimitManager` will replace
 * with actual IDs when looking up / creating the bucket at runtime.
 *
 * These numbers are *client-side guesses* based on typical platform behaviour.
 * They may need tuning as the Fluxor API evolves.
 */
import type { RateLimitConfig } from "./RateLimitConfig.js";

// ── Helper to define a config concisely ─────────────────────────────────────
function cfg(bucket: string, limit: number, windowMs: number, exemptFromGlobal = false): RateLimitConfig {
  return { bucket, limit, windowMs, exemptFromGlobal };
}

export const RateLimitMappings: Record<string, RateLimitConfig> = {
  // ── Global fallback ────────────────────────────────────────────────────
  global: cfg("global", 50, 1_000),

  // ── Auth ────────────────────────────────────────────────────────────────
  "auth.login": cfg("auth::login", 5, 60_000),
  "auth.register": cfg("auth::register", 5, 60_000),
  "auth.logout": cfg("auth::logout", 5, 60_000),
  "auth.verify": cfg("auth::verify", 5, 60_000),
  "auth.forgot": cfg("auth::forgot", 5, 60_000),
  "auth.reset": cfg("auth::reset", 5, 60_000),
  "auth.sessions": cfg("auth::sessions", 5, 5_000),

  // ── Channels ───────────────────────────────────────────────────────────
  "channels.get": cfg("channels::channel_id::get", 10, 10_000),
  "channels.update": cfg("channels::channel_id::update", 5, 10_000),
  "channels.delete": cfg("channels::channel_id::delete", 5, 10_000),
  "channels.messages.list": cfg("channels::channel_id::messages", 10, 10_000),
  "channels.messages.get": cfg("channels::channel_id::messages::get", 10, 10_000),
  "channels.messages.send": cfg("channels::channel_id::messages::send", 5, 5_000),
  "channels.messages.edit": cfg("channels::channel_id::messages::edit", 5, 5_000),
  "channels.messages.delete": cfg("channels::channel_id::messages::delete", 5, 5_000),
  "channels.messages.bulkDelete": cfg("channels::channel_id::messages::bulk_delete", 1, 5_000),
  "channels.typing": cfg("channels::channel_id::typing", 5, 5_000),
  "channels.messages.ack": cfg("channels::channel_id::messages::ack", 5, 5_000),
  "channels.pins.list": cfg("channels::channel_id::pins", 5, 10_000),
  "channels.pins.add": cfg("channels::channel_id::pins::add", 5, 10_000),
  "channels.pins.remove": cfg("channels::channel_id::pins::remove", 5, 10_000),
  "channels.reactions.get": cfg("channels::channel_id::reactions", 5, 5_000),
  "channels.reactions.add": cfg("channels::channel_id::reactions::add", 5, 5_000),
  "channels.reactions.remove": cfg("channels::channel_id::reactions::remove", 5, 5_000),
  "channels.reactions.removeAll": cfg("channels::channel_id::reactions::removeAll", 5, 5_000),
  "channels.attachments": cfg("channels::channel_id::attachments", 5, 10_000),
  "channels.recipients.add": cfg("channels::channel_id::recipients::add", 5, 10_000),
  "channels.recipients.remove": cfg("channels::channel_id::recipients::remove", 5, 10_000),
  "channels.invites.list": cfg("channels::channel_id::invites", 5, 10_000),
  "channels.invites.create": cfg("channels::channel_id::invites::create", 5, 10_000),
  "channels.webhooks.list": cfg("channels::channel_id::webhooks", 5, 10_000),
  "channels.webhooks.create": cfg("channels::channel_id::webhooks::create", 5, 10_000),
  "channels.search": cfg("channels::channel_id::search", 5, 10_000),
  "channels.call.get": cfg("channels::channel_id::call", 5, 10_000),
  "channels.call.update": cfg("channels::channel_id::call::update", 5, 10_000),
  "channels.call.ring": cfg("channels::channel_id::call::ring", 5, 10_000),
  "channels.call.stopRinging": cfg("channels::channel_id::call::stop_ringing", 5, 10_000),
  "channels.rtcRegions": cfg("channels::channel_id::rtc_regions", 5, 10_000),

  // ── Guilds ─────────────────────────────────────────────────────────────
  "guilds.create": cfg("guilds::create", 5, 60_000),
  "guilds.get": cfg("guilds::guild_id::get", 5, 10_000),
  "guilds.update": cfg("guilds::guild_id::update", 5, 10_000),
  "guilds.delete": cfg("guilds::guild_id::delete", 1, 60_000),
  "guilds.vanityUrl.get": cfg("guilds::guild_id::vanity_url", 5, 10_000),
  "guilds.vanityUrl.update": cfg("guilds::guild_id::vanity_url::update", 2, 10_000),
  "guilds.members.list": cfg("guilds::guild_id::members", 5, 10_000),
  "guilds.members.get": cfg("guilds::guild_id::members::get", 10, 10_000),
  "guilds.members.getCurrent": cfg("guilds::guild_id::members::me", 5, 10_000),
  "guilds.members.updateCurrent": cfg("guilds::guild_id::members::me::update", 5, 10_000),
  "guilds.members.update": cfg("guilds::guild_id::members::update", 5, 10_000),
  "guilds.members.kick": cfg("guilds::guild_id::members::kick", 5, 10_000),
  "guilds.transferOwnership": cfg("guilds::guild_id::transfer", 1, 60_000),
  "guilds.bans.list": cfg("guilds::guild_id::bans", 5, 10_000),
  "guilds.bans.add": cfg("guilds::guild_id::bans::add", 5, 10_000),
  "guilds.bans.remove": cfg("guilds::guild_id::bans::remove", 5, 10_000),
  "guilds.members.roles.add": cfg("guilds::guild_id::members::roles::add", 10, 10_000),
  "guilds.members.roles.remove": cfg("guilds::guild_id::members::roles::remove", 10, 10_000),
  "guilds.roles.create": cfg("guilds::guild_id::roles::create", 5, 10_000),
  "guilds.roles.update": cfg("guilds::guild_id::roles::update", 5, 10_000),
  "guilds.roles.updateBulk": cfg("guilds::guild_id::roles::bulk", 2, 10_000),
  "guilds.roles.delete": cfg("guilds::guild_id::roles::delete", 5, 10_000),
  "guilds.channels.list": cfg("guilds::guild_id::channels", 5, 10_000),
  "guilds.channels.create": cfg("guilds::guild_id::channels::create", 5, 10_000),
  "guilds.channels.update": cfg("guilds::guild_id::channels::update", 5, 10_000),
  "guilds.search": cfg("guilds::guild_id::search", 5, 10_000),
  "guilds.auditLogs.filters": cfg("guilds::guild_id::audit_logs::filters", 5, 10_000),
  "guilds.auditLogs.search": cfg("guilds::guild_id::audit_logs::search", 5, 10_000),
  "guilds.emojis.list": cfg("guilds::guild_id::emojis", 5, 10_000),
  "guilds.emojis.create": cfg("guilds::guild_id::emojis::create", 5, 30_000),
  "guilds.emojis.createBulk": cfg("guilds::guild_id::emojis::bulk", 1, 30_000),
  "guilds.emojis.update": cfg("guilds::guild_id::emojis::update", 5, 10_000),
  "guilds.emojis.delete": cfg("guilds::guild_id::emojis::delete", 5, 10_000),
  "guilds.stickers.list": cfg("guilds::guild_id::stickers", 5, 10_000),
  "guilds.stickers.create": cfg("guilds::guild_id::stickers::create", 5, 30_000),
  "guilds.stickers.createBulk": cfg("guilds::guild_id::stickers::bulk", 1, 30_000),
  "guilds.stickers.update": cfg("guilds::guild_id::stickers::update", 5, 10_000),
  "guilds.stickers.delete": cfg("guilds::guild_id::stickers::delete", 5, 10_000),
  "guilds.invites.list": cfg("guilds::guild_id::invites", 5, 10_000),
  "guilds.webhooks.list": cfg("guilds::guild_id::webhooks", 5, 10_000),
  "guilds.leave": cfg("guilds::guild_id::leave", 5, 10_000),

  // ── Users ──────────────────────────────────────────────────────────────
  "users.getCurrent": cfg("users::me", 5, 5_000),
  "users.updateCurrent": cfg("users::me::update", 2, 10_000),
  "users.get": cfg("users::user_id", 5, 5_000),
  "users.profile": cfg("users::user_id::profile", 5, 5_000),
  "users.checkTag": cfg("users::check_tag", 5, 5_000),
  "users.settings.get": cfg("users::me::settings", 5, 5_000),
  "users.settings.update": cfg("users::me::settings::update", 2, 10_000),
  "users.notes.list": cfg("users::me::notes", 5, 10_000),
  "users.notes.get": cfg("users::me::notes::get", 5, 5_000),
  "users.notes.set": cfg("users::me::notes::set", 2, 5_000),
  "users.guilds.list": cfg("users::me::guilds", 5, 5_000),
  "users.mentions.list": cfg("users::me::mentions", 5, 5_000),
  "users.mentions.delete": cfg("users::me::mentions::delete", 5, 5_000),
  "users.betaCodes.list": cfg("users::me::beta_codes", 5, 10_000),
  "users.betaCodes.create": cfg("users::me::beta_codes::create", 2, 30_000),
  "users.betaCodes.delete": cfg("users::me::beta_codes::delete", 5, 10_000),
  "users.memes.list": cfg("users::me::memes", 5, 10_000),
  "users.memes.create": cfg("users::me::memes::create", 5, 10_000),
  "users.memes.get": cfg("users::me::memes::get", 5, 5_000),
  "users.memes.update": cfg("users::me::memes::update", 5, 10_000),
  "users.memes.delete": cfg("users::me::memes::delete", 5, 10_000),

  // ── Invites ────────────────────────────────────────────────────────────
  "invites.get": cfg("invites::invite_code", 5, 5_000),
  "invites.join": cfg("invites::invite_code::join", 5, 30_000),
  "invites.delete": cfg("invites::invite_code::delete", 5, 10_000),

  // ── Attachments ────────────────────────────────────────────────────────
  "attachments.delete": cfg("attachments::delete", 5, 10_000),

  // ── Reports ────────────────────────────────────────────────────────────
  "reports.message": cfg("reports::message", 3, 60_000),
  "reports.user": cfg("reports::user", 3, 60_000),
  "reports.guild": cfg("reports::guild", 3, 60_000),

  // ── Read States ────────────────────────────────────────────────────────
  "readStates.ackBulk": cfg("read_states::ack_bulk", 5, 5_000),

  // ── Webhooks ───────────────────────────────────────────────────────────
  "webhooks.get": cfg("webhooks::webhook_id", 5, 5_000),
  "webhooks.update": cfg("webhooks::webhook_id::update", 5, 10_000),
  "webhooks.delete": cfg("webhooks::webhook_id::delete", 5, 10_000),
  "webhooks.execute": cfg("webhooks::webhook_id::execute", 5, 5_000),

  // ── Tenor ──────────────────────────────────────────────────────────────
  "tenor.search": cfg("tenor::search", 10, 5_000),
  "tenor.featured": cfg("tenor::featured", 10, 5_000),
  "tenor.trending": cfg("tenor::trending", 10, 5_000),
  "tenor.registerShare": cfg("tenor::register_share", 5, 5_000),
  "tenor.suggest": cfg("tenor::suggest", 10, 5_000),
};
