import React from 'react';
import { Navigate } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      redirect: false,
    };
    this._redirectTimeout = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.hasError && !prevState.hasError) {
      this._redirectTimeout = setTimeout(() => {
        this.setState({ redirect: true });
      }, 1200);
    }
  }

  componentWillUnmount() {
    if (this._redirectTimeout) {
      clearTimeout(this._redirectTimeout);
    }
  }

  render() {
    if (this.state.redirect) {
      return <Navigate replace to="/error/500" />;
    }

    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: 32,
            textAlign: 'center',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h2>Oops! Something went wrong.</h2>
          <p>Redirecting to error page...</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;