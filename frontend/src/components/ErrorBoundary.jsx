import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Something went wrong</h2>
          <p className="text-stone-400 text-sm mb-6">An unexpected error occurred. Please try refreshing the page.</p>
          <div className="flex gap-3">
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-5 py-2.5 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors">
              Refresh Page
            </button>
            <Link to="/" className="px-5 py-2.5 bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl hover:bg-stone-200 transition-colors">
              Go Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
