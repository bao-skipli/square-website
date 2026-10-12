import React, { PureComponent } from "react";
import {
  BellIcon,
  ChatIcon,
  HelpIcon,
  SparkleIcon,
} from "@/components/ui/Icon";

export default class DashboardSidebarFooter extends PureComponent {
  render() {
    return (
      <div className="sq-sidebar-bottom">
        <div className="sq-sidebar-icons-row">
          <button type="button" className="sq-icon-button" aria-label="Notifications">
            <BellIcon />
          </button>
          <button type="button" className="sq-icon-button" aria-label="Messages">
            <ChatIcon />
          </button>
          <button type="button" className="sq-icon-button" aria-label="Help">
            <HelpIcon />
          </button>
          <button type="button" className="sq-icon-button" aria-label="AI Assistant">
            <SparkleIcon />
          </button>
        </div>
        <button
          type="button"
          className="sq-btn-take-payment"
          onClick={() => alert("Take Payment Modal opened")}
        >
          Take payment
        </button>
      </div>
    );
  }
}
