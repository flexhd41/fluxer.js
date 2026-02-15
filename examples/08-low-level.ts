/**
 * 08 - Low-Level Usage
 *
 * Demonstrates using ApiClient and GatewayClient separately
 * without the high-level Client wrapper. Useful when you need
 * full control over the connection lifecycle or want to use
 * only the REST client without a gateway connection.
 *
 * Run:
 *   npx tsx examples/08-low-level.ts
 */

import {
  ApiClient,
  GatewayClient,
  createConsoleLogger,
} from "../src/index.js";

const TOKEN = process.env.FLUXOR_TOKEN ?? "Bot YOUR_TOKEN_HERE";

// ── Example A: REST-only (no WebSocket) ─────────────────────────────────────

async function restOnlyExample() {
  console.log("=== REST-Only Example ===\n");

  const api = new ApiClient(TOKEN, {
    logger: createConsoleLogger("info"),
    requestTimeout: 10_000,
  });

  // Fetch the bot's own user
  const me = await api.getCurrentUser();
  console.log(`Bot user: ${me.username} (${me.id})`);

  // Fetch guilds
  const guilds = await api.getCurrentUserGuilds();
  console.log(`Guilds: ${guilds.length}`);
  for (const g of guilds) {
    console.log(`  - ${g.name} (${g.id})`);
  }

  // Fetch DM channels
  const dms = await api.getDmChannels();
  console.log(`DM channels: ${dms.length}`);

  console.log("\n=== REST-Only Complete ===\n");
}

// ── Example B: Gateway-only with manual event handling ──────────────────────

async function gatewayOnlyExample() {
  console.log("=== Gateway-Only Example ===\n");

  const api = new ApiClient(TOKEN, {
    logger: createConsoleLogger("warn"),
  });

  const gateway = new GatewayClient(TOKEN, {
    logger: createConsoleLogger("info"),
    presence: { status: "idle" },
    ignoredGatewayEvents: ["PRESENCE_UPDATE"],
    reconnectDelay: 3,
    maxReconnectAttempts: 5,
  });

  // Track latency manually
  gateway.on("HEARTBEAT_ACK", (latency) => {
    console.log(`Heartbeat latency: ${latency}ms`);
  });

  gateway.on("READY", (data) => {
    console.log(`Connected! Session: ${data.session_id}`);
    console.log(`User: ${data.user.username}`);
    console.log(`Guilds: ${data.guilds.length}`);
  });

  gateway.on("MESSAGE_CREATE", async (msg) => {
    if (msg.author?.bot) return;

    console.log(`Message from ${msg.author?.username}: ${msg.content}`);

    if (msg.content === "!ping") {
      // Use the separate API client to send the response
      await api.sendMessage(msg.channel_id, `Pong! Latency: ${gateway.ping}ms`);
    }

    if (msg.content === "!disconnect") {
      console.log("Disconnect requested. Shutting down...");
      gateway.destroy();
      process.exit(0);
    }
  });

  // Use purpose-built methods instead of raw send
  gateway.on("GUILD_CREATE", (guild) => {
    console.log(`Guild available: ${guild.name}`);
    // Subscribe to guild events
    gateway.subscribeGuild(guild.id);
  });

  gateway.on("close", ({ code, reason }) => {
    console.log(`Gateway closed: ${code} "${reason}"`);
  });

  gateway.on("error", (err) => {
    console.error(`Gateway error: ${err.message}`);
  });

  // waitFor works on the gateway client too
  gateway.on("MESSAGE_CREATE", async (msg) => {
    if (msg.content === "!waitdemo") {
      await api.sendMessage(msg.channel_id, "Send any message within 10 seconds...");
      try {
        const response = await gateway.waitFor("MESSAGE_CREATE", {
          filter: (m) =>
            m.channel_id === msg.channel_id &&
            m.author?.id === msg.author?.id,
          timeout: 10_000,
        });
        await api.sendMessage(msg.channel_id, `You said: ${response.content}`);
      } catch {
        await api.sendMessage(msg.channel_id, "Timed out.");
      }
    }
  });

  await gateway.connect();
  console.log("Gateway-only bot running. Try: !ping, !waitdemo, !disconnect\n");
}

// ── Run both examples ───────────────────────────────────────────────────────

async function main() {
  // Run REST-only first (no persistent connection needed)
  await restOnlyExample();

  // Then start the gateway example (runs indefinitely)
  await gatewayOnlyExample();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
