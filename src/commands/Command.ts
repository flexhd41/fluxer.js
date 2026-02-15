/**
 * Core types for the command framework.
 */
import type { CommandContext } from "./CommandContext.js";
import type { CommandError, RunMode } from "../types/enums.js";

// ── Precondition ────────────────────────────────────────────────────────────

export interface PreconditionResult {
  success: boolean;
  error?: CommandError;
  reason?: string;
}

export type Precondition = (ctx: CommandContext) => PreconditionResult | Promise<PreconditionResult>;

// ── Type parser ─────────────────────────────────────────────────────────────

export interface TypeParser<T = unknown> {
  /** The type name shown in help text. */
  name: string;
  /** Parse a raw string argument into the target type. Returns `undefined` on failure. */
  parse(value: string, ctx: CommandContext): T | undefined | Promise<T | undefined>;
}

// ── Parameter definition ────────────────────────────────────────────────────

export interface CommandParameter {
  name: string;
  type: TypeParser;
  optional?: boolean;
  defaultValue?: unknown;
  summary?: string;
}

// ── Command definition ──────────────────────────────────────────────────────

export interface CommandDefinition {
  /** Primary command name (matched after the prefix). */
  name: string;
  /** Alternative names that also trigger this command. */
  aliases?: string[];
  /** Short description for help text. */
  summary?: string;
  /** Detailed usage info. */
  remarks?: string;
  /** How the command should be executed. */
  runMode?: RunMode;
  /** Preconditions that must pass before execution. */
  preconditions?: Precondition[];
  /** Parameter definitions for argument parsing. */
  parameters?: CommandParameter[];
  /** The handler function. */
  execute: (ctx: CommandContext, ...parsedArgs: unknown[]) => void | Promise<void>;
}

// ── Command search result ───────────────────────────────────────────────────

export interface CommandSearchResult {
  command: CommandDefinition;
  /** The alias that matched (may differ from `command.name`). */
  matchedAlias: string;
}

// ── Execution result ────────────────────────────────────────────────────────

export interface CommandResult {
  success: boolean;
  error?: CommandError;
  reason?: string;
  exception?: unknown;
}
