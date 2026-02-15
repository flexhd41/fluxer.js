/**
 * Fluxor Gateway WebSocket operation codes.
 * Mirrors FluxerOpCode from the .NET SDK.
 */
export enum FluxorOpCode {
  /** Server dispatches an event to the client. */
  Dispatch = 0,
  /** Heartbeat packet to maintain connection. */
  Heartbeat = 1,
  /** Client sends to authenticate / start a new session. */
  Identify = 2,
  /** Client sends to update presence (status, activity). */
  PresenceUpdate = 3,
  /** Client sends to update voice state. */
  VoiceStateUpdate = 4,
  /** Client pings the voice server. */
  VoiceServerPing = 5,
  /** Client sends to resume a previous session. */
  Resume = 6,
  /** Server requests the client to reconnect. */
  Reconnect = 7,
  /** Client requests guild member list. */
  RequestGuildMembers = 8,
  /** Server indicates the session is invalid. */
  InvalidSession = 9,
  /** Server's first message after WS connect — contains heartbeat_interval. */
  Hello = 10,
  /** Server acknowledges a heartbeat. */
  HeartbeatAck = 11,
  /** Client connects to a call. */
  CallConnect = 13,
  /** Client subscribes to guild events. */
  GuildSubscriptions = 14,
}
