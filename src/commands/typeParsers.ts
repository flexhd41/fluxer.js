/**
 * Built-in type parsers for command arguments.
 */
import type { TypeParser } from "./Command.js";

export const StringParser: TypeParser<string> = {
  name: "string",
  parse(value) {
    return value;
  },
};

export const NumberParser: TypeParser<number> = {
  name: "number",
  parse(value) {
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  },
};

export const IntegerParser: TypeParser<number> = {
  name: "integer",
  parse(value) {
    const n = parseInt(value, 10);
    return Number.isNaN(n) ? undefined : n;
  },
};

export const BooleanParser: TypeParser<boolean> = {
  name: "boolean",
  parse(value) {
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "yes" || lower === "1") return true;
    if (lower === "false" || lower === "no" || lower === "0") return false;
    return undefined;
  },
};

export const BigIntParser: TypeParser<bigint> = {
  name: "bigint",
  parse(value) {
    try {
      return BigInt(value);
    } catch {
      return undefined;
    }
  },
};

/** Default set of type parsers keyed by type name. */
export const defaultTypeParsers: Record<string, TypeParser> = {
  string: StringParser,
  number: NumberParser,
  integer: IntegerParser,
  boolean: BooleanParser,
  bigint: BigIntParser,
};
