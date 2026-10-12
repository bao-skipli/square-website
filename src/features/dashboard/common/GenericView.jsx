import React, { PureComponent } from "react";

export default class GenericView extends PureComponent {
  render() {
    const { label } = this.props;

    return (
      <section className="sq-generic-view" aria-label={label}>
        <div className="sq-generic-view-header">
          <h1 className="sq-generic-view-title">{label}</h1>
        </div>
        <div className="sq-generic-card">
          <h2 className="sq-generic-empty-title">{label}</h2>
          <p className="sq-generic-empty-desc">
            This section is ready for configuration. You can manage {label.toLowerCase()} and linked settings here.
          </p>
        </div>
      </section>
    );
  }
}
