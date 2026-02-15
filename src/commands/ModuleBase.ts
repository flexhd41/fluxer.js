/**
 * Base class for command modules.
 * Provides lifecycle hooks and a convenience `reply()` helper.
 *
 * Extend this class and define commands via `getCommands()`.
 */
import type { CommandContext } from "./CommandContext.js";
import type { CommandDefinition } from "./Command.js";
import type { Message, CreateMessagePayload } from "../types/models.js";

export abstract class ModuleBase {
  /** The current execution context — set by the CommandService before execution. */
  public context!: CommandContext;

  /**
   * Return the command definitions provided by this module.
   * Override in subclasses.
   */
  abstract getCommands(): CommandDefinition[];

  /** Called before every command in this module executes. Override to add setup logic. */
  async beforeExecute(_ctx: CommandContext): Promise<void> {
    // no-op by default
  }

  /** Called after every command in this module executes. Override to add teardown logic. */
  async afterExecute(_ctx: CommandContext): Promise<void> {
    // no-op by default
  }

  /** Convenience: reply to the current channel. */
  protected async reply(message: string | CreateMessagePayload): Promise<Message> {
    return this.context.reply(message);
  }
}
