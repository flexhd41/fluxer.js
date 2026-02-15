/**
 * Gateway packet shapes sent over the WebSocket.
 */
import type { FluxorOpCode } from "./opcodes.js";
import type { PresenceData } from "../config.js";

/** Generic gateway packet as received / sent on the wire. */
export interface GatewayPacket<D = unknown> {
  op: FluxorOpCode;
  d: D | null;
  s: number | null;
  t: string | null;
}

// ── Server → Client payloads ─────────────────────────────────────────────

export interface HelloData {
  heartbeat_interval: number;
}

// ── Client → Server payloads ─────────────────────────────────────────────

export interface IdentifyData {
  token: string;
  properties: Record<string, string>;
  presence?: PresenceData;
  ignored_gateway_events?: string[];
}

export interface ResumeData {
  token: string;
  session_id: string;
  seq: number;
}

export interface HeartbeatData {
  op: FluxorOpCode.Heartbeat;
  d: number | null;
}
