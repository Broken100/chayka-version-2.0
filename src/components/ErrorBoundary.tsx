/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-coffee-bg text-espresso flex items-center justify-center p-6" id="error-boundary-fallback">
          <div className="max-w-md w-full bg-editorial-bg border border-espresso/15 p-8 rounded-2xl shadow-md text-center space-y-6">
            <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black font-serif">Algo salió mal</h2>
              <p className="text-espresso/70 text-xs leading-relaxed">
                La aplicación encontró un error inesperado. Puedes intentar recargar la página.
              </p>
            </div>
            {this.state.error && (
              <div className="bg-espresso/5 border border-espresso/10 p-3 rounded-lg text-left">
                <p className="text-[10px] font-mono text-rose-600 break-all">{this.state.error.message}</p>
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="w-full bg-espresso hover:bg-espresso/90 text-coffee-bg font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Recargar Página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
