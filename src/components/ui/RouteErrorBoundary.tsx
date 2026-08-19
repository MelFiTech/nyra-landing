import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={{ padding: 24, maxWidth: 520 }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 650 }}>This page failed to load</p>
        <p style={{ margin: '8px 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {this.state.error.message || 'An unexpected error occurred.'}
        </p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          style={{
            height: 36,
            padding: '0 14px',
            borderRadius: 8,
            border: '1px solid var(--border-mid)',
            background: 'var(--surface)',
            color: 'var(--text-1)',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    )
  }
}
