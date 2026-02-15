/**
 * 03 - Command Framework
 *
 * Demonstrates the full command framework: registering commands,
 * argument parsing, preconditions, aliases, and module-based grouping.
 *
 * Run:
 *   npx tsx examples/03-commands.ts
 */

import {
  Client,
  CommandService,
  ModuleBase,
  EmbedBuilder,
  NumberParser,
  StringParser,
  requireGuild,
  createConsoleLogger,
} from "../src/index.js";
import type { CommandDefinition } from "../src/index.js";

const TOKEN = process.env.FLUXOR_TOKEN ?? "Bot YOUR_TOKEN_HERE";

const bot = new Client(TOKEN, {
  logger: createConsoleLogger("info"),
  presence: { status: "online" },
});

bot.enableGracefulShutdown();

// ── Create the command service ──────────────────────────────────────────────

const commands = new CommandService({
  prefix: "!",
  caseSensitive: false,
});

// ── Plain object commands ───────────────────────────────────────────────────

const ping: CommandDefinition = {
  name: "ping",
  aliases: ["p", "latency"],
  summary: "Check bot latency",
  execute: async (ctx) => {
    await ctx.reply(`Pong! Gateway latency: ${bot.ping}ms`);
  },
};

const say: CommandDefinition = {
  name: "say",
  summary: "Make the bot say something",
  parameters: [
    { name: "text", type: StringParser, summary: "The text to repeat" },
  ],
  execute: async (ctx, text: unknown) => {
    await ctx.reply(text as string);
  },
};

const roll: CommandDefinition = {
  name: "roll",
  aliases: ["dice", "random"],
  summary: "Roll a die with N sides (default: 6)",
  parameters: [
    { name: "sides", type: NumberParser, optional: true, defaultValue: 6, summary: "Number of sides" },
  ],
  execute: async (ctx, sides: unknown) => {
    const n = sides as number;
    const result = Math.floor(Math.random() * n) + 1;
    await ctx.reply(`You rolled a **${result}** (d${n})`);
  },
};

const math: CommandDefinition = {
  name: "math",
  aliases: ["calc"],
  summary: "Add two numbers together",
  parameters: [
    { name: "a", type: NumberParser, summary: "First number" },
    { name: "b", type: NumberParser, summary: "Second number" },
  ],
  execute: async (ctx, a: unknown, b: unknown) => {
    const sum = (a as number) + (b as number);
    await ctx.reply(`${a} + ${b} = **${sum}**`);
  },
};

const help: CommandDefinition = {
  name: "help",
  aliases: ["commands", "h"],
  summary: "List all available commands",
  execute: async (ctx) => {
    const allCmds = commands.getCommands();
    const embed = new EmbedBuilder()
      .setTitle("Available Commands")
      .setColor(0x5865f2);

    for (const cmd of allCmds) {
      const aliases = cmd.aliases?.length ? ` (aliases: ${cmd.aliases.join(", ")})` : "";
      const params = cmd.parameters?.map((p) => p.optional ? `[${p.name}]` : `<${p.name}>`).join(" ") ?? "";
      embed.addField(
        `!${cmd.name} ${params}`.trim(),
        (cmd.summary ?? "No description") + aliases,
      );
    }

    await ctx.replyEmbed(embed.build());
  },
};

// Guild-only command using a precondition
const serveronly: CommandDefinition = {
  name: "serveronly",
  summary: "This command only works in a server",
  preconditions: [requireGuild()],
  execute: async (ctx) => {
    await ctx.reply(`This is guild **${ctx.guildId}**`);
  },
};

commands.addCommands(ping, say, roll, math, help, serveronly);

// ── Module-based commands ───────────────────────────────────────────────────

class UtilityModule extends ModuleBase {
  getCommands(): CommandDefinition[] {
    return [
      {
        name: "uptime",
        summary: "Show bot uptime",
        execute: async (ctx) => {
          const secs = Math.floor(bot.uptime / 1000);
          const mins = Math.floor(secs / 60);
          const hrs = Math.floor(mins / 60);
          await this.reply(`Uptime: ${hrs}h ${mins % 60}m ${secs % 60}s`);
        },
      },
      {
        name: "stats",
        summary: "Show bot statistics",
        execute: async (ctx) => {
          const embed = new EmbedBuilder()
            .setTitle("Bot Statistics")
            .setColor(0x2f3136)
            .addFields(
              { name: "Guilds", value: `${bot.guilds.size}`, inline: true },
              { name: "Channels", value: `${bot.channels.size}`, inline: true },
              { name: "Users", value: `${bot.users.size}`, inline: true },
              { name: "Ping", value: `${bot.ping}ms`, inline: true },
              { name: "Uptime", value: `${Math.floor(bot.uptime / 1000)}s`, inline: true },
            )
            .setTimestamp()
            .build();

          await this.reply({ embeds: [embed] });
        },
      },
      {
        name: "userinfo",
        aliases: ["user", "whois"],
        summary: "Show info about a user",
        parameters: [
          { name: "userId", type: StringParser, optional: true, summary: "User ID to look up" },
        ],
        execute: async (ctx, userId: unknown) => {
          const targetId = (userId as string | undefined) ?? ctx.user?.id;
          if (!targetId) {
            await this.reply("Could not determine user.");
            return;
          }

          try {
            const user = await bot.api.getUser(targetId);
            const embed = new EmbedBuilder()
              .setTitle(user.username)
              .setColor(0x5865f2)
              .addFields(
                { name: "ID", value: user.id, inline: true },
                { name: "Tag", value: user.tag, inline: true },
                { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
              )
              .setTimestamp()
              .build();
            await this.reply({ embeds: [embed] });
          } catch {
            await this.reply("Could not find that user.");
          }
        },
      },
    ];
  }

  async beforeExecute() {
    console.log(`[UtilityModule] Executing command in channel ${this.context.channelId}`);
  }
}

commands.addModule(new UtilityModule());

// ── Wire up message events ──────────────────────────────────────────────────

bot.on("READY", () => {
  console.log(`Logged in as ${bot.user?.username}`);
  console.log(`Registered ${commands.getCommands().length} commands.`);
});

bot.on("MESSAGE_CREATE", async (msg) => {
  if (msg.author?.bot) return;

  const argPos = commands.hasPrefix(msg.content ?? "");
  if (argPos >= 0) {
    const result = await commands.execute(msg, bot.api, bot.gateway, argPos);
    if (!result.success) {
      switch (result.error) {
        case "UNKNOWN_COMMAND":
          // silently ignore unknown commands
          break;
        case "BAD_ARG_COUNT":
          await bot.send(msg.channel_id, `Missing argument: ${result.reason}`);
          break;
        case "PARSE_FAILED":
          await bot.send(msg.channel_id, `Invalid argument: ${result.reason}`);
          break;
        case "UNMET_PRECONDITION":
          await bot.send(msg.channel_id, `Cannot run: ${result.reason}`);
          break;
        default:
          await bot.send(msg.channel_id, `Error: ${result.reason}`);
      }
    }
  }
});

async function main() {
  await bot.connect();
  console.log("Command bot running. Try: !help");
}

main().catch(console.error);
