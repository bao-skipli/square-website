import React, { useState } from "react";
import { SearchIcon, ChevronDownIcon } from "@/components/ui/Icon";
import ModifiersEmptyState from "./components/ModifiersEmptyState";
import ModifiersTable from "./components/ModifiersTable";
import "./ModifiersView.css";

export default function ModifiersView({
  modifierSets = [],
  locations = [{ id: "loc-skipli", name: "Skipli" }],
  isLoading = false,
  onOpenCreateModifier,
  onOpenEditModifier,
  onOpenApplyToItems,
  onReorderSets,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // If still loading, do not flash empty state
  if (isLoading) {
    return null;
  }

  // If no modifier sets in the library, show the empty state
  if (modifierSets.length === 0) {
    return <ModifiersEmptyState onCreateClick={onOpenCreateModifier} />;
  }

  // Filter modifier sets
  const filteredSets = modifierSets.filter((set) => {
    // 1. Search filter (case-insensitive & diacritic-insensitive)
    if (searchQuery.trim()) {
      const normName = (set.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const normQuery = searchQuery.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!normName.includes(normQuery)) return false;
    }

    // 2. Channel filter
    if (selectedChannel !== "all") {
      if (set.type === "text") {
        // Text modifiers only available on websites/kiosks
        if (selectedChannel === "pos") return false;
      } else {
        if (!set.channels?.all && !set.channels?.[selectedChannel]) return false;
      }
    }

    // 3. Modifier type filter
    if (selectedType !== "all") {
      if (set.type !== selectedType) return false;
    }

    return true;
  });

  return (
    <div className="sq-modifiers-page">
      {/* Top Header */}
      <div className="sq-modifiers-header-row">
        <div>
          <h1 className="sq-modifiers-page-title">Modifiers</h1>
          <p className="sq-modifiers-page-desc">
            Modifiers are customizable options that can be applied to an item at checkout.
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="sq-modifiers-filter-bar">
        <div className="sq-modifiers-filters-left">
          {/* Search Box */}
          <div className="sq-modifiers-search-box">
            <span className="sq-modifiers-search-icon">
              <SearchIcon size={15} color="#71717a" />
            </span>
            <input
              type="text"
              className="sq-modifiers-search-input"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search modifiers"
            />
          </div>

          {/* Channels Filter Dropdown */}
          <div className="sq-modifiers-select-wrap">
            <select
              className="sq-modifiers-select"
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              aria-label="Filter channels"
            >
              <option value="all">Channels</option>
              <option value="pointsOfSale">Points of sale</option>
              <option value="online">Online</option>
              <option value="kiosk">Kiosk</option>
            </select>
            <span className="sq-modifiers-select-chevron">
              <ChevronDownIcon size={12} color="#71717a" />
            </span>
          </div>

          {/* Modifier Type Filter Dropdown */}
          <div className="sq-modifiers-select-wrap">
            <select
              className="sq-modifiers-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter modifier type"
            >
              <option value="all">Modifier type</option>
              <option value="list">List</option>
              <option value="text">Text</option>
            </select>
            <span className="sq-modifiers-select-chevron">
              <ChevronDownIcon size={12} color="#71717a" />
            </span>
          </div>
        </div>

        {/* Create Button on the Right */}
        <div className="sq-modifiers-actions-right">
          <button
            type="button"
            className="sq-modifiers-btn-primary-pill"
            onClick={onOpenCreateModifier}
          >
            Create a modifier
          </button>
        </div>
      </div>

      {/* Table State */}
      {filteredSets.length === 0 ? (
        <div className="sq-modifiers-no-results">
          No modifiers match the selected filters.
        </div>
      ) : (
        <ModifiersTable
          modifierSets={filteredSets}
          locations={locations}
          onEditSet={onOpenEditModifier}
          onApplyToItems={onOpenApplyToItems}
          onReorderSets={onReorderSets}
        />
      )}
    </div>
  );
}
