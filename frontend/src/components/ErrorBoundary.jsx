import { Component } from "react";
import { Button } from "./ui/Button.jsx";
import { Icon } from "./ui/Icon.jsx";

/** Last line of defence: a render crash shows a recovery screen, not a blank page. */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled UI error", error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-danger/15 text-danger">
          <Icon name="alert" className="size-7" />
        </span>
        <h1 className="text-xl font-semibold text-ink">This page stopped working</h1>
        <p className="max-w-sm text-sm text-muted">{this.state.error.message}</p>
        <Button className="mt-2" onClick={() => window.location.assign("/")}>
          Reload the app
        </Button>
      </div>
    );
  }
}
