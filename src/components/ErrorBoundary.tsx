import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Home, LogOut, ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  correlationId: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    correlationId: null
  };

  public static getDerivedStateFromError(error: Error): State {
    const correlationId = `ERR-${Math.floor(100000 + Math.random() * 900000)}`;
    return { hasError: true, error, correlationId };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Munevo Recovery ${this.state.correlationId}] Interface exception caught:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleReturnHome = () => {
    window.location.href = '/';
  };

  private handleSignOut = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0c14',
          color: '#ffffff',
          fontFamily: 'Inter, system-ui, sans-serif',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(18, 20, 28, 0.95)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={28} style={{ color: '#ef4444' }} />
            </div>

            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#fff' }}>
                Munevo Cloud Recovery Interface
              </h1>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary, #9aa3b2)', lineHeight: 1.6, marginTop: '8px', margin: 0 }}>
                Munevo encountered an unexpected interface error. Your current action may not have completed.
              </p>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
              padding: '12px 16px',
              fontSize: '0.78rem',
              fontFamily: 'monospace',
              color: '#f87171',
              width: '100%',
              textAlign: 'left',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>Correlation ID: <strong>{this.state.correlationId}</strong></span>
              <span style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.7rem' }}>Protected Boundary</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', width: '100%', marginTop: '8px' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 0,
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={14} /> Retry
              </button>

              <button
                onClick={this.handleReturnHome}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.1)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Home size={14} /> Return Home
              </button>

              <button
                onClick={this.handleSignOut}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
