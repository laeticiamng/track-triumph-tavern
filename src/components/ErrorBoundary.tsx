import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <h2 className="font-display text-2xl font-bold">Oups, quelque chose s'est mal passé</h2>
          <p className="mt-3 text-muted-foreground max-w-md">
            Une erreur inattendue est survenue. Essayez de rafraîchir la page.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Réessayer
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
