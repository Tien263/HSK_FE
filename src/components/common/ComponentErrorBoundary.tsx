"use client";

import React, { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary] Error in ${this.props.name || "Component"}:`, error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ padding: 16, margin: "8px 0", borderRadius: 12, background: "#fdf8f6", border: "1px solid #f2cfc7", color: "#a23c21", fontSize: 13 }}>
          <strong>Đã xảy ra sự cố hiển thị ở mục {this.props.name || "này"}.</strong>
          <p style={{ margin: "4px 0", fontSize: 12, color: "#6e2918" }}>
            {this.state.error?.message || "Lỗi giao diện không mong muốn."}
          </p>
          <button
            type="button"
            onClick={this.reset}
            style={{ marginTop: 6, padding: "4px 12px", borderRadius: 6, background: "#a23c21", color: "#fff", border: "none", fontSize: 11, cursor: "pointer" }}
          >
            Thử tải lại mục này
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
