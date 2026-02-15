/**
 * 06 - Caches and REST API
 *
 * Demonstrates the client's built-in caches (guilds, channels, users)
 * and various REST API calls: fetching users, managing messages,
 * channel operations, and role management.
 *
 * Run:
 *   npx tsx examples/06-caches-and-api.ts
 */

import { Client, EmbedBuilder, createConsoleLogger, ChannelType } from "../src/index.js";

const TOKEN = process.env.FLUXOR_TOKEN ?? "Bot YOUR_TOKEN_HERE";

const bot = new Client(TOKEN, {
  logger: createConsoleLogger("info"),
  presence: { status: "online" },
});

bot.enableGracefulShutdown();

bot.on("READY", () => {
  console.log(`Logged in as ${bot.user?.username}`);
  console.log(`Cached: ${bot.guilds.size} guilds, ${bot.channels.size} channels`);
});

bot.on("MESSAGE_CREATE", async (msg) => {
  if (msg.author?.bot) return;

  // ── Cache inspection ──────────────────────────────────────────────────

  if (msg.content === "!cache") {
    const lines = [
      `**Guilds:** ${bot.guilds.size}`,
      `**Channels:** ${bot.channels.size}`,
      `**Users:** ${bot.users.size}`,
      `**Ready:** ${bot.isReady}`,
      `**Uptime:** ${Math.floor(bot.uptime / 1000)}s`,
      `**Ping:** ${bot.ping}ms`,
    ];
    await bot.send(msg.channel_id, lines.join("\n"));
  }

  // ── List guilds from cache ────────────────────────────────────────────

  if (msg.content === "!guilds") {
    const guildList = [...bot.guilds.values()]
      .map((g) => `- **${g.name}** (${g.id}) -- ${g.member_count ?? "?"} members`)
      .join("\n");

    await bot.send(msg.channel_id, guildList || "No guilds cached.");
  }

  // ── List channels in this guild from cache ────────────────────────────

  if (msg.content === "!channels") {
    if (!msg.guild_id) {
      await bot.send(msg.channel_id, "This command only works in a server.");
      return;
    }

    const channels = [...bot.channels.values()]
      .filter((c) => c.guild_id === msg.guild_id)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    const grouped: Record<string, string[]> = {
      text: [],
      voice: [],
      category: [],
      other: [],
    };

    for (const ch of channels) {
      const label = `${ch.name ?? "unnamed"} (${ch.id})`;
      switch (ch.type) {
        case ChannelType.GuildText:
          grouped.text.push(`#${label}`);
          break;
        case ChannelType.GuildVoice:
          grouped.voice.push(label);
          break;
        case ChannelType.GuildCategory:
          grouped.category.push(label);
          break;
        default:
          grouped.other.push(label);
      }
    }

    const embed = new EmbedBuilder()
      .setTitle("Server Channels")
      .setColor(0x5865f2);

    if (grouped.category.length) embed.addField("Categories", grouped.category.join("\n"));
    if (grouped.text.length) embed.addField("Text Channels", grouped.text.join("\n"));
    if (grouped.voice.length) embed.addField("Voice Channels", grouped.voice.join("\n"));
    if (grouped.other.length) embed.addField("Other", grouped.other.join("\n"));

    await bot.send(msg.channel_id, { embeds: [embed.build()] });
  }

  // ── Fetch a user from the API ─────────────────────────────────────────

  if (msg.content?.startsWith("!user ")) {
    const userId = msg.content.slice(6).trim();
    if (!userId) {
      await bot.send(msg.channel_id, "Usage: `!user <user_id>`");
      return;
    }

    try {
      const user = await bot.api.getUser(userId);
      const embed = new EmbedBuilder()
        .setTitle(user.username)
        .setColor(0x5865f2)
        .addFields(
          { name: "ID", value: user.id, inline: true },
          { name: "Tag", value: user.tag, inline: true },
          { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
        );

      if (user.bio) embed.addField("Bio", user.bio);

      await bot.send(msg.channel_id, { embeds: [embed.build()] });
    } catch {
      await bot.send(msg.channel_id, "Could not find that user.");
    }
  }

  // ── Fetch recent messages ─────────────────────────────────────────────

  if (msg.content === "!recent") {
    try {
      const messages = await bot.api.getMessages(msg.channel_id, { limit: 5 });
      const lines = messages.map(
        (m) => `[${m.author.username}]: ${m.content.slice(0, 60)}${m.content.length > 60 ? "..." : ""}`,
      );
      await bot.send(msg.channel_id, "**Last 5 messages:**\n```\n" + lines.join("\n") + "\n```");
    } catch (err) {
      await bot.send(msg.channel_id, `Failed to fetch messages: ${err}`);
    }
  }

  // ── List guild roles from the API ─────────────────────────────────────

  if (msg.content === "!roles") {
    if (!msg.guild_id) {
      await bot.send(msg.channel_id, "This command only works in a server.");
      return;
    }

    const guild = bot.guilds.get(msg.guild_id);
    if (!guild?.roles?.length) {
      await bot.send(msg.channel_id, "No roles cached for this guild.");
      return;
    }

    const roleList = guild.roles
      .sort((a, b) => b.position - a.position)
      .map((r) => {
        const colorHex = r.color ? `#${r.color.toString(16).padStart(6, "0")}` : "default";
        return `- **${r.name}** (${colorHex}) -- position ${r.position}`;
      })
      .join("\n");

    await bot.send(msg.channel_id, `**Roles (${guild.roles.length}):**\n${roleList}`);
  }

  // ── Get the bot's own profile ─────────────────────────────────────────

  if (msg.content === "!me") {
    const user = await bot.api.getCurrentUser();
    const embed = new EmbedBuilder()
      .setTitle(`${user.username}#${user.tag}`)
      .setColor(0x00aaff)
      .addFields(
        { name: "ID", value: user.id, inline: true },
        { name: "Bot", value: user.bot ? "Yes" : "No", inline: true },
        { name: "MFA", value: user.mfa_enabled ? "Enabled" : "Disabled", inline: true },
        { name: "Verified", value: user.verified ? "Yes" : "No", inline: true },
      )
      .setTimestamp()
      .build();

    await bot.send(msg.channel_id, { embeds: [embed] });
  }
});

async function main() {
  await bot.connect();
  console.log("Cache/API bot running. Try: !cache, !guilds, !channels, !user <id>, !recent, !roles, !me");
}

main().catch(console.error);
