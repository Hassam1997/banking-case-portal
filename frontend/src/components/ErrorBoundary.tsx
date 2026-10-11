import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State { failed: boolean }

export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error', error, info.componentStack)
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="state-box" style={{ margin: 40 }}>
        <h2>Something went wrong</h2>
        <p className="muted">An unexpected error occurred. Your data is safe.</p>
        <button className="btn btn-primary" onClick={() => window.location.assign('/')}>
          Reload the app
        </button>
      </div>
    )
  }
}