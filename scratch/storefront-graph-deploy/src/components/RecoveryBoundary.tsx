import React from 'react';
import { BrandMark } from './BrandMark';

export class RecoveryBoundary extends React.Component<{
  children: React.ReactNode;
  onRecover?: () => void;
  resetKey?: string;
  compact?: boolean;
}, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidUpdate(previous: Readonly<typeof this.props>) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false });
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className={this.props.compact ? 'view-recovery-overlay' : 'view-recovery-page'} role="alert">
      <div className="view-recovery-card"><BrandMark /><h1>This view couldn’t open.</h1>
        <p>Your saved items are still on this device. Return to browsing and try again.</p>
        <button type="button" onClick={() => {
          if (this.props.onRecover) { this.props.onRecover(); this.setState({ failed: false }); }
          else window.location.reload();
        }}>{this.props.onRecover ? 'Back to browsing' : 'Reload page'}</button>
      </div>
    </div>;
  }
}
