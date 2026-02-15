/**
 * Token utilities — validation and stripping for gateway use.
 */

/**
 * Validates that the token is non-empty and has a recognised prefix.
 *  - Bot tokens must start with `"Bot "` (including the trailing space).
 *  - User tokens must start with `"flx_"`.
 *
 * @throws {Error} If the token is invalid.
 */
export function validateToken(token: string): void {
  if (!token || token.trim().length === 0) {
    throw new Error("Token must not be null or empty.");
  }

  if (!token.startsWith("Bot ") && !token.startsWith("flx_")) {
    const preview = token.length > 8 ? token.slice(0, 8) : token;
    throw new Error(
      `Invalid token format. Bot tokens must be prefixed with 'Bot ' (e.g. 'Bot <token>') ` +
        `and user tokens must be prefixed with 'flx_'. ` +
        `Received token starting with: '${preview}...'`
    );
  }
}

/**
 * Returns the raw token suitable for the gateway IDENTIFY / RESUME payload.
 * The gateway protocol expects only the raw token, not the HTTP "Bot " prefix.
 */
export function getGatewayToken(token: string): string {
  if (token.startsWith("Bot ")) {
    return token.slice(4);
  }
  return token;
}
