import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";
import i18n from "@/i18n";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("ErrorBoundary", error.message, info.componentStack);

    // Report to Sentry if available
    if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).Sentry) {
      try {
        const Sentry = (window as unknown as Record<string, { captureException: (e: Error, ctx?: unknown) => void }>).Sentry;
        Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
      } catch {
        // Sentry not properly initialized, skip
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const t = i18n.t.bind(i18n);

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <h2 className="font-display text-2xl font-bold">{t("errors.title")}</h2>
          <p className="mt-3 text-muted-foreground max-w-md">
            {t("errors.message")}
          </p>
          {this.state.error && (
            <details className="mt-4 max-w-md text-left text-xs text-muted-foreground">
              <summary className="cursor-pointer hover:text-foreground">
                Technical details
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-words rounded-md bg-muted p-3">
                {this.state.error.message}
              </pre>
            </details>
          )}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {t("errors.retry")}
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              {t("errors.backHome")}
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
