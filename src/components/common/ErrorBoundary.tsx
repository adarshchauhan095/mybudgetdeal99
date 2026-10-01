import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logCrash } from '../../services/crashAnalytics';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Send to Crash Analytics
    logCrash({
      message: error.message || 'React rendering crashed',
      stack: error.stack,
      type: 'react_error_boundary',
      componentStack: errorInfo.componentStack || undefined,
      fatal: true
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    const base = import.meta.env.BASE_URL || '/';
    window.location.href = base;
  };

  private handleCopyDetails = () => {
    const { error, errorInfo } = this.state;
    const text = `Error: ${error?.message}\n\nStack:\n${error?.stack}\n\nComponent Stack:\n${errorInfo?.componentStack}`;
    navigator.clipboard.writeText(text).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.5rem',
          backgroundColor: 'var(--bg-primary, #f8fafc)',
          color: 'var(--text-primary, #0f172a)',
          fontFamily: 'Inter, system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            backgroundColor: 'var(--bg-card, #ffffff)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle, rgba(0,0,0,0.1))',
            padding: '2.5rem 2rem',
            boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.1))',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <AlertTriangle size={32} />
            </div>

            <h1 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              marginBottom: '0.75rem',
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--text-primary, #0f172a)'
            }}>
              Something went wrong
            </h1>

            <p style={{
              fontSize: '0.95rem',
              color: 'var(--text-secondary, #475569)',
              lineHeight: 1.6,
              marginBottom: '2rem'
            }}>
              An unexpected issue interrupted this page. The diagnostics have been automatically reported to our crash monitor. You can refresh or return safely to the home catalog.
            </p>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={this.handleReload}
                className="btn btn-primary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <RefreshCw size={17} />
                Reload Page
              </button>

              <button
                onClick={this.handleGoHome}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.4rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              >
                <Home size={17} />
                Go to Homepage
              </button>
            </div>

            <div style={{
              marginTop: '1.5rem',
              borderTop: '1px solid var(--border-subtle, rgba(0,0,0,0.08))',
              paddingTop: '1.25rem',
              textAlign: 'left'
            }}>
              <button
                onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: 'var(--text-muted, #64748b)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
              >
                <span>Technical Diagnostics</span>
                {this.state.showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {this.state.showDetails && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginBottom: '0.5rem'
                  }}>
                    <button
                      onClick={this.handleCopyDetails}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.78rem',
                        color: 'var(--accent-primary, #f97316)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      {this.state.copied ? <Check size={14} /> : <Copy size={14} />}
                      {this.state.copied ? 'Copied to Clipboard' : 'Copy Diagnostics'}
                    </button>
                  </div>
                  <pre style={{
                    backgroundColor: 'var(--bg-tertiary, #f1f5f9)',
                    color: 'var(--text-primary, #0f172a)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    lineHeight: 1.45,
                    maxHeight: '160px',
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: '1px solid var(--border-subtle, rgba(0,0,0,0.06))'
                  }}>
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
