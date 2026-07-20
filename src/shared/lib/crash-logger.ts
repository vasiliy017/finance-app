/**
 * Single point of entry for unexpected-error telemetry.
 *
 * Right now this only mirrors the error to `console.error` with a structured
 * payload. The whole point of routing every catch site through `logCrash` is
 * that wiring up Sentry / Bugsnag / a self-hosted collector later is a one-
 * function change here, with zero diff at the call sites.
 *
 * Call from:
 *   - React `ErrorBoundary.componentDidCatch`
 *   - Top-level `.catch` blocks where we swallow / show a friendly message
 *   - Persistence rehydration error handlers
 *
 * Do NOT call from expected validation paths (form errors, etc.) — the
 * signal-to-noise ratio of a crash logger drops fast once it doubles as a
 * generic warning channel.
 */
export type CrashContext = {
  /** Stable identifier of where the failure originated, e.g. 'ErrorBoundary'. */
  scope: string;
  /** Optional free-form key/value pairs for additional debugging context. */
  extra?: Record<string, unknown>;
};

export function logCrash(error: unknown, context: CrashContext): void {
  const payload = {
    scope: context.scope,
    name: error instanceof Error ? error.name : 'NonError',
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    extra: context.extra,
  };

  // eslint-disable-next-line no-console -- the whole purpose of this module.
  console.error('[crash]', payload);

  // Future wiring point — keep the surface narrow so swapping is mechanical:
  //   Sentry.captureException(error, { tags: { scope: context.scope }, extra: context.extra });
}
