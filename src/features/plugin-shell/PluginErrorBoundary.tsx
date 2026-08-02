/**
 * Title: Plugin error boundary
 * Purpose: Turn a render-time failure into a readable panel so Decky keeps the plugin alive.
 * Used for: Wrapping the whole bonsAI content tree in index.tsx.
 * Solves: A throwing component blanking the QAM with no on-screen explanation.
 * Does not: Catch errors from event handlers, effects, or RPC rejections — React boundaries
 *   only see render, and those paths report through toasts and the app log instead.
 */
import React from "react";

export class PluginErrorBoundary extends React.Component<any, { error: any; info?: any }> {
  /** Initialize boundary state with no captured error. */
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  /** Capture runtime render errors and persist debug details for the fallback panel. */
  componentDidCatch(error: any, info: any) {
    this.setState({ error, info });
    try {
      console.error("React render error", error, info);
    } catch (e) {}
  }

  /** Render either the fallback UI or the child tree based on current boundary state. */
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 16, color: "white" }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Plugin error</div>
          <div style={{ color: "tomato", whiteSpace: "pre-wrap" }}>{String(this.state.error)}</div>
          <pre style={{ color: "gray", whiteSpace: "pre-wrap" }}>{this.state.info?.componentStack ?? ""}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
