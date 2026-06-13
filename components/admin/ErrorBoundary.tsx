'use client';

import { Component } from 'react';

type Props = { children: React.ReactNode; fallback?: React.ReactNode };
type State = { hasError: boolean; error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-medium text-sm">Une erreur est survenue dans cette section.</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 text-sm text-red-600 hover:underline"
            >
              Réessayer
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
