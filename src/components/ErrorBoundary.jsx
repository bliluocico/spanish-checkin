import { Component } from 'react'

// 全局错误边界 — 白屏时显示错误信息
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('页面错误:', error, info)
  }

  componentDidMount() {
    // 捕获全局 JS 错误（React 错误边界之外）
    window.__errorHandler = (msg, source, line, col, error) => {
      this.setState({ hasError: true, error: error || new Error(msg) })
    }
    window.addEventListener('error', window.__errorHandler)
    window.addEventListener('unhandledrejection', (e) => {
      this.setState({ hasError: true, error: e.reason || new Error('Promise 错误') })
    })
  }

  componentWillUnmount() {
    window.removeEventListener('error', window.__errorHandler)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 12,
          background: 'var(--parchment)', padding: 24, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>😵</div>
          <h2 style={{ color: 'var(--ink)', fontSize: 18, fontWeight: 700 }}>页面出了点问题</h2>
          <p style={{ color: 'var(--ink-light)', fontSize: 13, maxWidth: 320, wordBreak: 'break-all' }}>
            {this.state.error?.message || '未知错误'}
          </p>
          <button onClick={this.handleReset}
            style={{
              padding: '10px 24px', background: 'var(--ink)', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14,
            }}>
            刷新重试
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
