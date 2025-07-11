type ErrorParams = Record<string, unknown>;

export class BaseError extends Error {
  public readonly params?: ErrorParams = {};
  public readonly code: string = "ERROR_BASE";
  public readonly httpStatus: number = 500;

  constructor(
    message: string,
    opts: { cause?: Error; params?: Record<string, unknown> } = {},
  ) {
    super(message, opts.cause ? { cause: opts.cause } : undefined);
    this.params = opts.params;
  }

  valueOf() {
    return {
      message: this.message,
      stack: this.stack || "<stack missing>",
      code: this.code,
      params: this.params,
    };
  }

  static toResponse(err: unknown) {
    let body = { message: String(err), stack: "no-stack", code: "ERROR_UNKNOWN" };
    let httpStatus = 500;

    if (err instanceof Error) {
      body = {
        message: err.message,
        stack: err.stack ?? "no-stack",
        code: "ERROR_UNKNOWN",
      };
    }

    if (err instanceof BaseError) {
      body = err.valueOf();
      httpStatus = err.httpStatus;
    }

    return { body, httpStatus };
  }
}

export class ValidationError extends BaseError {
  public readonly code: string = "ERROR_VALIDATION";
  public readonly httpStatus: number = 400;
}
