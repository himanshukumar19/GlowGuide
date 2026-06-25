import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside Dashboard widget:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center border border-dashed border-destructive/30 rounded-gg bg-destructive/5 select-none">
            <span className="text-xl block mb-2">📊</span>
            <h3 className="font-heading text-base font-bold text-destructive mb-1">
              Visual Widget Error
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              {this.state.error?.message || "There was a problem loading this graph layout."}
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
