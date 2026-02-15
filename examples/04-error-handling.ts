/**
 * 04 - Error Handling
 *
 * Demonstrates how to handle different error types from the REST API
 * and the gateway, including rate limits, not-found, forbidden,
 * and request timeouts.
 *
 * Run:
 *   npx tsx examples/04-error-handling.ts
 */

import {
  Client,
  FluxorApiError,
  FluxorRateLimitError,
  FluxorNotFoundError,
  FluxorForbiddenError,
  createConsoleLogger,
} from "../src/index.js";

const TOKEN = process.env.FLUXOR_TOKEN ?? "Bot YOUR_TOKEN_HERE";

const bot = new Client(TOKEN, {
  logger: createConsoleLogger("info"),
  presence: { status: "online" },
  requestTimeout: 10_000, // 10 second timeout
});

bot.enableGracefulShutdown();

// ── Gateway error handling ──────────────────────────────────────────────────

bot.on("error", (err) => {
  console.error("[Gateway Error]", err.message);
});

bot.on("close", ({ code, reason }) => {
  console.warn(`[Gateway Closed] code=${code} reason="${reason}"`);
});

// ── Events ──────────────────────────────────────────────────────────────────

bot.on("READY", () => {
  console.log(`Logged in as ${bot.user?.username}`);
});

bot.on("MESSAGE_CREATE", async (msg) => {
  if (msg.author?.bot) return;

  // ── Try fetching a non-existent user ──────────────────────────────────

  if (msg.content === "!notfound") {
    try {
      await bot.api.getUser("000000000000000000");
    } catch (err) {
      if (err instanceof FluxorNotFoundError) {
        await bot.send(msg.channel_id, `Caught FluxorNotFoundError: ${err.message}`);
      } else {
        await bot.send(msg.channel_id, `Unexpected error: ${err}`);
      }
    }
  }

  // ── Try an action we might not have permission for ────────────────────

  if (msg.content === "!forbidden") {
    try {
      // Attempt to delete someone else's message without permission
      await bot.api.deleteMessage(msg.channel_id, msg.id);
    } catch (err) {
      if (err instanceof FluxorForbiddenError) {
        await bot.send(msg.channel_id, `Caught FluxorForbiddenError: ${err.message}`);
      } else if (err instanceof FluxorApiError) {
        await bot.send(msg.channel_id, `API error (${err.status}): ${err.message}`);
      } else {
        await bot.send(msg.channel_id, `Unexpected error: ${err}`);
      }
    }
  }

  // ── Demonstrate catching rate limits ──────────────────────────────────

  if (msg.content === "!ratelimit") {
    await bot.send(msg.channel_id, "Sending 10 messages rapidly...");

    let sent = 0;
    let rateLimited = false;

    for (let i = 0; i < 10; i++) {
      try {
        await bot.api.sendMessage(msg.channel_id, `Message ${i + 1}/10`);
        sent++;
      } catch (err) {
        if (err instanceof FluxorRateLimitError) {
          await bot.send(
            msg.channel_id,
            `Rate limited after ${sent} messages! Retry after ${err.retryAfter}ms`,
          );
          rateLimited = true;
          break;
        }
        throw err;
      }
    }

    if (!rateLimited) {
      await bot.send(msg.channel_id, `All ${sent} messages sent without rate limit.`);
    }
  }

  // ── Demonstrate comprehensive error catching ──────────────────────────

  if (msg.content === "!errortest") {
    const testCases = [
      { label: "Valid channel", fn: () => bot.api.getChannel(msg.channel_id) },
      { label: "Invalid channel", fn: () => bot.api.getChannel("0") },
      { label: "Valid user", fn: () => bot.api.getCurrentUser() },
    ];

    const results: string[] = [];

    for (const test of testCases) {
      try {
        await test.fn();
        results.push(`${test.label}: OK`);
      } catch (err) {
        if (err instanceof FluxorRateLimitError) {
          results.push(`${test.label}: RATE LIMITED (retry ${err.retryAfter}ms)`);
        } else if (err instanceof FluxorNotFoundError) {
          results.push(`${test.label}: NOT FOUND`);
        } else if (err instanceof FluxorForbiddenError) {
          results.push(`${test.label}: FORBIDDEN`);
        } else if (err instanceof FluxorApiError) {
          results.push(`${test.label}: API ERROR ${err.status}`);
        } else if (err instanceof Error && err.name === "AbortError") {
          results.push(`${test.label}: TIMEOUT`);
        } else {
          results.push(`${test.label}: UNKNOWN ERROR`);
        }
      }
    }

    await bot.send(msg.channel_id, "```\n" + results.join("\n") + "\n```");
  }
});

async function main() {
  await bot.connect();
  console.log("Error handling bot running. Try: !notfound, !forbidden, !ratelimit, !errortest");
}

main().catch(console.error);
