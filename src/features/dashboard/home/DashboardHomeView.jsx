import React, { PureComponent } from "react";
import HomeOnboardingGrid from "./HomeOnboardingGrid";
import HomeMetricsSection from "./HomeMetricsSection";

export default class DashboardHomeView extends PureComponent {
  render() {
    const {
      dismissedPosCard,
      onDismissPos,
      aiQuery,
      onAiSubmit,
      onAiQueryChange,
      selectedDateChip,
      selectedVsChip,
      selectedChecksChip,
    } = this.props;

    return (
      <div className="sq-home-view-container">
<header className="sq-dashboard-header">
          <h1 className="sq-dashboard-title">Set up your business to start selling</h1>
          <p className="sq-dashboard-subtitle">1 of 6 steps completed</p>
        </header>

<HomeOnboardingGrid
          dismissedPosCard={dismissedPosCard}
          onDismissPos={onDismissPos}
        />

<HomeMetricsSection
          aiQuery={aiQuery}
          onAiSubmit={onAiSubmit}
          onAiQueryChange={onAiQueryChange}
          selectedDateChip={selectedDateChip}
          selectedVsChip={selectedVsChip}
          selectedChecksChip={selectedChecksChip}
        />
      </div>
    );
  }
}
