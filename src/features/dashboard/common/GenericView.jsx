import React, { PureComponent } from "react";

export default class GenericView extends PureComponent {
  render() {
    const displayLabel = this.props.label || this.props.title || "Section";

    return (
      <section className="sq-generic-view" aria-label={displayLabel}>
        <div className="sq-generic-view-header">
          <h1 className="sq-generic-view-title">{displayLabel}</h1>
        </div>
        <div className="sq-generic-card">
          <h2 className="sq-generic-empty-title">{displayLabel}</h2>
          <p className="sq-generic-empty-desc">
            This section is ready for configuration. You can manage {displayLabel.toLowerCase()} and linked settings here.
          </p>
        </div>
      </section>
    );
  }
}
