import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error inside ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-[#ba1a1a]/20 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#ba1a1a]/10 flex items-center justify-center text-[#ba1a1a]">
            <span className="material-symbols-outlined text-2xl">error</span>
          </div>
          <h2 className="text-xl font-bold text-[#111e1d]">
            {this.props.fallbackTitle || 'Component Rendering Notice'}
          </h2>
          <p className="text-sm text-[#445f73] max-w-md">
            {this.state.error?.message || 'An unexpected rendering error occurred. Please refresh or retry.'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2 rounded-xl bg-[#00666f] text-white text-sm font-medium hover:bg-[#005259] transition-all shadow-sm"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
