/**
 * Built-in precondition factories for the command framework.
 */
import { CommandError } from "../types/enums.js";
import type { Precondition, PreconditionResult } from "./Command.js";
import type { CommandContext } from "./CommandContext.js";

const ok: PreconditionResult = { success: true };

/**
 * Requires the command to be run inside a guild (not a DM).
 */
export function requireGuild(): Precondition {
  return (ctx: CommandContext) => {
    if (ctx.guildId) return ok;
    return {
      success: false,
      error: CommandError.UnmetPrecondition,
      reason: "This command can only be used in a guild.",
    };
  };
}

/**
 * Requires the command user to be the bot owner.
 * Pass the owner user ID(s) when constructing.
 */
export function requireOwner(...ownerIds: string[]): Precondition {
  const set = new Set(ownerIds);
  return (ctx: CommandContext) => {
    const userId = ctx.user?.id;
    if (userId && set.has(userId)) return ok;
    return {
      success: false,
      error: CommandError.UnmetPrecondition,
      reason: "This command can only be used by the bot owner.",
    };
  };
}

/**
 * Requires the invoking user to have specific permission bits.
 * `requiredBits` should be a bigint permission bitfield.
 *
 * **Note:** This checks the `permissions` field on the gateway member payload.
 * For full accuracy you may need to resolve from the guild member's roles.
 */
export function requirePermissions(requiredBits: bigint): Precondition {
  return (ctx: CommandContext) => {
    const raw = ctx.message.member_permissions as string | undefined;
    if (!raw) {
      return {
        success: false,
        error: CommandError.UnmetPrecondition,
        reason: "Could not determine user permissions.",
      };
    }
    const userBits = BigInt(raw);
    // Administrator bypasses everything
    const adminBit = 1n << 3n;
    if ((userBits & adminBit) === adminBit) return ok;
    if ((userBits & requiredBits) === requiredBits) return ok;
    return {
      success: false,
      error: CommandError.UnmetPrecondition,
      reason: "You do not have the required permissions for this command.",
    };
  };
}
