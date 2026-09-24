import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', background: '#fbf8f3', minHeight: '100vh', color: '#1f1b18', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <h1 style={{ color: '#e53e3e', marginTop: 0 }}>Something went wrong.</h1>
            <p>An unexpected error occurred in the application.</p>
            <pre style={{ background: '#f7fafc', padding: '1rem', borderRadius: '4px', overflowX: 'auto', fontSize: '14px' }}>
              {this.state.error && this.state.error.toString()}
            </pre>
            <button 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '1rem', background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
