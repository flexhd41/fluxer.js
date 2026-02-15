/**
 * Thrown when the Fluxor REST API returns a non-success status code.
 */
export class FluxorApiError extends Error {
  /** HTTP status code returned by the API. */
  public readonly status: number;

  /** Raw response body (may be JSON string or empty). */
  public readonly body: string;

  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "FluxorApiError";
    this.status = status;
    this.body = body;
  }

  /** Attempt to parse the body as JSON. Returns `undefined` on failure. */
  get json(): unknown {
    try {
      return JSON.parse(this.body);
    } catch {
      return undefined;
    }
  }
}

/**
 * Thrown when the API returns 429 (Too Many Requests).
 */
export class FluxorRateLimitError extends FluxorApiError {
  /** Milliseconds the client should wait before retrying. */
  public readonly retryAfter: number;

  constructor(message: string, body: string, retryAfter: number) {
    super(message, 429, body);
    this.name = "FluxorRateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Thrown when the API returns 404 (Not Found).
 */
export class FluxorNotFoundError extends FluxorApiError {
  constructor(message: string, body: string) {
    super(message, 404, body);
    this.name = "FluxorNotFoundError";
  }
}

/**
 * Thrown when the API returns 403 (Forbidden).
 */
export class FluxorForbiddenError extends FluxorApiError {
  constructor(message: string, body: string) {
    super(message, 403, body);
    this.name = "FluxorForbiddenError";
  }
}
