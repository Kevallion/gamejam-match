"use client"

import { Component, type ReactNode } from "react"

type Props = {
  children: ReactNode
  fallback: ReactNode
}

type State = {
  hasError: boolean
}

/** Keeps a carousel render error from taking down the rest of the home page. */
export class UpcomingJamsErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
