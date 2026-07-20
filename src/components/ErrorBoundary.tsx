import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0c10',
          color: '#ffffff',
          fontFamily: 'system-ui, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '550px',
            width: '100%',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 12px 0', color: '#ef4444' }}>
              Munevo Cloud Recovery Interface
            </h1>
            <p style={{ fontSize: '14px', color: '#9aa3b2', lineHeight: '1.6', margin: '0 0 20px 0' }}>
              An unexpected rendering exception was caught inside the frontend thread. The database and backend systems remain secure.
            </p>
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '16px',
              fontSize: '12px',
              fontFamily: 'monospace',
              color: '#f87171',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '20px',
              border: '1px solid rgba(255,255,255,0.03)'
            }}>
              <strong>Error:</strong> {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                border: 0,
                padding: '10px 20px',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'opacity 0.2s'
              }}
            >
              Force Session Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
