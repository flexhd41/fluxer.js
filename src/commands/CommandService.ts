/**
 * Central command service — registers commands, parses messages, and dispatches.
 *
 * Mirrors Fluxer.Net/Commands/CommandService.cs.
 */
import { CommandError } from "../types/enums.js";
import type {
  CommandDefinition,
  CommandResult,
  CommandSearchResult,
  Precondition,
} from "./Command.js";
import { CommandContext } from "./CommandContext.js";
import { ModuleBase } from "./ModuleBase.js";
import type { ApiClient } from "../api/ApiClient.js";
import type { GatewayClient } from "../gateway/GatewayClient.js";
import type { MessageEventData } from "../types/gateway.js";
import { noopLogger, type Logger } from "../util/logger.js";

export interface CommandServiceOptions {
  /** Command prefix character(s). Default: `"!"`. */
  prefix?: string;
  /** Logger instance. */
  logger?: Logger;
  /** Whether prefix matching is case-sensitive. Default: `false`. */
  caseSensitive?: boolean;
}

export class CommandService {
  public readonly prefix: string;
  private readonly _commands: CommandDefinition[] = [];
  private readonly _modules: ModuleBase[] = [];
  private readonly _log: Logger;
  private readonly _caseSensitive: boolean;

  constructor(options?: CommandServiceOptions) {
    this.prefix = options?.prefix ?? "!";
    this._log = options?.logger ?? noopLogger;
    this._caseSensitive = options?.caseSensitive ?? false;
  }

  // ── Registration ──────────────────────────────────────────────────────

  /** Register a single command definition. */
  addCommand(cmd: CommandDefinition): this {
    this._commands.push(cmd);
    this._log.debug(`Registered command: ${cmd.name}`);
    return this;
  }

  /** Register multiple commands at once. */
  addCommands(...cmds: CommandDefinition[]): this {
    for (const cmd of cmds) this.addCommand(cmd);
    return this;
  }

  /** Register all commands from a ModuleBase subclass instance. */
  addModule(mod: ModuleBase): this {
    this._modules.push(mod);
    const cmds = mod.getCommands();
    for (const cmd of cmds) {
      // Wrap the execute fn so lifecycle hooks run
      const originalExecute = cmd.execute;
      cmd.execute = async (ctx, ...args) => {
        mod.context = ctx;
        await mod.beforeExecute(ctx);
        await originalExecute.call(mod, ctx, ...args);
        await mod.afterExecute(ctx);
      };
      this._commands.push(cmd);
    }
    this._log.debug(`Registered module with ${cmds.length} command(s).`);
    return this;
  }

  /** Register commands from a plain object map. */
  addCommandsFromObject(obj: Record<string, CommandDefinition>): this {
    for (const cmd of Object.values(obj)) this.addCommand(cmd);
    return this;
  }

  // ── Search ────────────────────────────────────────────────────────────

  /** Find a command by name or alias. */
  search(name: string): CommandSearchResult | null {
    const needle = this._caseSensitive ? name : name.toLowerCase();
    for (const cmd of this._commands) {
      const cmdName = this._caseSensitive ? cmd.name : cmd.name.toLowerCase();
      if (cmdName === needle) return { command: cmd, matchedAlias: cmd.name };
      if (cmd.aliases) {
        for (const alias of cmd.aliases) {
          const a = this._caseSensitive ? alias : alias.toLowerCase();
          if (a === needle) return { command: cmd, matchedAlias: alias };
        }
      }
    }
    return null;
  }

  /** Get all registered commands. */
  getCommands(): readonly CommandDefinition[] {
    return this._commands;
  }

  // ── Execution ─────────────────────────────────────────────────────────

  /**
   * Parse the message content and execute the matching command.
   *
   * @param message  The gateway MESSAGE_CREATE event data.
   * @param api      REST API client for the command context.
   * @param gateway  Gateway client for the command context.
   * @param argPos   Character index where the prefix ends (0 = check from start).
   * @returns A result indicating success / failure.
   */
  async execute(
    message: MessageEventData,
    api: ApiClient,
    gateway: GatewayClient,
    argPos = 0,
  ): Promise<CommandResult> {
    const content = message.content ?? "";

    // ── Prefix check ──
    const afterPrefix = content.slice(argPos);
    if (!afterPrefix.startsWith(this.prefix)) {
      return { success: false, error: CommandError.UnknownCommand, reason: "No prefix match." };
    }

    const withoutPrefix = afterPrefix.slice(this.prefix.length).trim();
    const spaceIdx = withoutPrefix.indexOf(" ");
    const cmdName = spaceIdx === -1 ? withoutPrefix : withoutPrefix.slice(0, spaceIdx);

    if (!cmdName) {
      return { success: false, error: CommandError.UnknownCommand, reason: "Empty command name." };
    }

    // ── Search ──
    const result = this.search(cmdName);
    if (!result) {
      return {
        success: false,
        error: CommandError.UnknownCommand,
        reason: `Unknown command: ${cmdName}`,
      };
    }

    const cmd = result.command;
    const ctx = new CommandContext(message, api, gateway, argPos);

    // ── Preconditions ──
    if (cmd.preconditions) {
      for (const precond of cmd.preconditions) {
        const check = await precond(ctx);
        if (!check.success) {
          return {
            success: false,
            error: check.error ?? CommandError.UnmetPrecondition,
            reason: check.reason ?? "Precondition failed.",
          };
        }
      }
    }

    // ── Argument parsing ──
    const parsedArgs: unknown[] = [];
    if (cmd.parameters && cmd.parameters.length > 0) {
      const rawArgs = ctx.args;
      for (let i = 0; i < cmd.parameters.length; i++) {
        const param = cmd.parameters[i];
        const rawValue = rawArgs[i];

        if (rawValue === undefined) {
          if (param.optional) {
            parsedArgs.push(param.defaultValue);
          } else {
            return {
              success: false,
              error: CommandError.BadArgCount,
              reason: `Missing required argument: ${param.name}`,
            };
          }
        } else {
          const parsed = await param.type.parse(rawValue, ctx);
          if (parsed === undefined) {
            return {
              success: false,
              error: CommandError.ParseFailed,
              reason: `Could not parse "${rawValue}" as ${param.type.name} for parameter "${param.name}".`,
            };
          }
          parsedArgs.push(parsed);
        }
      }
    }

    // ── Execute ──
    try {
      await cmd.execute(ctx, ...parsedArgs);
      return { success: true };
    } catch (err) {
      this._log.error(`Error executing command "${cmdName}":`, err);
      return {
        success: false,
        error: CommandError.Exception,
        reason: err instanceof Error ? err.message : String(err),
        exception: err,
      };
    }
  }

  /**
   * Check if a message starts with the configured prefix.
   * Returns the argPos (always 0 for simple prefix) or -1 if no match.
   */
  hasPrefix(content: string): number {
    if (content.startsWith(this.prefix)) return 0;
    return -1;
  }
}
