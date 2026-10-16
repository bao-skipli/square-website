import React, { PureComponent } from "react";
import {
  PosMonitorIcon,
  ShieldCheckIcon,
  HardwareGridIcon,
  CreditCardIcon,
} from "@/components/ui/Icon";

export default class HomeOnboardingGrid extends PureComponent {
  render() {
    const { dismissedPosCard, onDismissPos } = this.props;

    return (
      <section className="sq-onboarding-grid" aria-label="Setup Guides">
<div className="sq-card-promo">
          <span className="sq-promo-expiry">Expires in 2 days 23 hours</span>
          <p className="sq-promo-text">
            Get free processing on up to $1,000 when you take your first card payment
          </p>
        </div>

{!dismissedPosCard && (
          <div className="sq-card-standard">
            <div>
              <div className="sq-card-icon-wrap">
                <PosMonitorIcon />
              </div>
              <h3 className="sq-card-title">Demo your new POS</h3>
              <p className="sq-card-desc">Run a test sale to get familiar.</p>
            </div>
            <div className="sq-card-actions">
              <button type="button" className="sq-btn-pill-gray">
                Try it out
              </button>
              <button
                type="button"
                className="sq-link-dismiss"
                onClick={onDismissPos}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

<div className="sq-card-standard">
          <div>
            <div className="sq-card-icon-wrap">
              <ShieldCheckIcon />
            </div>
            <h3 className="sq-card-title">Get approved to take payments</h3>
            <p className="sq-card-desc">Verify your identity to accept payments.</p>
          </div>
          <div className="sq-card-actions">
            <button type="button" className="sq-btn-pill-gray">
              Verify your identity
            </button>
          </div>
        </div>

<div className="sq-card-standard">
          <div>
            <div className="sq-card-icon-wrap">
              <HardwareGridIcon />
            </div>
            <h3 className="sq-card-title">Add hardware</h3>
            <p className="sq-card-desc">Order hardware or set up devices you have.</p>
          </div>
          <div className="sq-card-actions">
            <button type="button" className="sq-btn-pill-gray">
              Shop hardware
            </button>
            <button type="button" className="sq-link-dismiss">
              Set up hardware
            </button>
          </div>
        </div>

<div className="sq-card-standard">
          <div>
            <div className="sq-card-icon-wrap">
              <CreditCardIcon />
            </div>
            <h3 className="sq-card-title">Take your first payment</h3>
            <p className="sq-card-desc">Choose how you'd like to take your first payment.</p>
          </div>
          <div className="sq-card-actions">
            <button type="button" className="sq-btn-pill-gray">
              Get started
            </button>
          </div>
        </div>

<div className="sq-card-empty" aria-hidden="true" />
      </section>
    );
  }
}
