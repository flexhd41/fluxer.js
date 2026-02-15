/**
 * Fluxor-specific WebSocket close codes and logic to decide whether we should reconnect.
 */

export enum FluxorCloseCode {
  UnknownError = 4000,
  UnknownOpCode = 4001,
  DecodeError = 4002,
  NotAuthenticated = 4003,
  AuthenticationFailed = 4004,
  AlreadyAuthenticated = 4005,
  InvalidSequence = 4007,
  RateLimited = 4008,
  SessionTimedOut = 4009,
  InvalidShard = 4010,
  ShardingRequired = 4011,
  InvalidApiVersion = 4012,
  InvalidIntents = 4013,
  DisallowedIntents = 4014,
}

/** Returns `true` if the client should attempt to reconnect after receiving this close code. */
export function shouldReconnect(code: number): boolean {
  switch (code) {
    case FluxorCloseCode.AuthenticationFailed:
    case FluxorCloseCode.InvalidShard:
    case FluxorCloseCode.ShardingRequired:
    case FluxorCloseCode.InvalidApiVersion:
    case FluxorCloseCode.InvalidIntents:
    case FluxorCloseCode.DisallowedIntents:
      return false;
    default:
      return true;
  }
}
