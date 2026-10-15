/**
 * Shared modifier utilities for Storefront & Dashboard
 */

/**
 * Merge base modifier set configuration with item-level overrides.
 * @param {object} set - Original modifier set from library
 * @param {object} [itemOverride] - Overrides from item.modifierSets[setId]?.overrides
 * @returns {object} Effective modifier set ready for display and validation
 */
export function getEffectiveSettings(set, itemOverride = null) {
  if (!set) return null;

  const overrides = itemOverride || {};
  const isText = set.type === "text";

  // Merge selection rules
  const baseRules = set.selectionRules || { required: false, allowMultiple: false };
  const overrideRules = overrides.selectionRules || {};
  const effectiveRules = isText
    ? null
    : {
        required:
          overrideRules.required !== undefined
            ? Boolean(overrideRules.required)
            : Boolean(baseRules.required),
        allowMultiple:
          overrideRules.allowMultiple !== undefined
            ? Boolean(overrideRules.allowMultiple)
            : Boolean(baseRules.allowMultiple),
        min: overrideRules.min !== undefined ? overrideRules.min : baseRules.min,
        max: overrideRules.max !== undefined ? overrideRules.max : baseRules.max,
      };

  // Merge display settings
  const baseDisplay = set.displaySettings || {
    hideOnReceipts: false,
    conversational: false,
    sortSoldOutLast: false,
  };
  const overrideDisplay = overrides.displaySettings || {};
  const effectiveDisplay = {
    hideOnReceipts:
      overrideDisplay.hideOnReceipts !== undefined
        ? Boolean(overrideDisplay.hideOnReceipts)
        : Boolean(baseDisplay.hideOnReceipts),
    conversational:
      overrideDisplay.conversational !== undefined
        ? Boolean(overrideDisplay.conversational)
        : Boolean(baseDisplay.conversational),
    sortSoldOutLast:
      overrideDisplay.sortSoldOutLast !== undefined
        ? Boolean(overrideDisplay.sortSoldOutLast)
        : Boolean(baseDisplay.sortSoldOutLast),
  };

  // Resolve preselect map and in-stock status for list modifiers
  let rawModifiers = [];
  if (!isText && set.modifiers) {
    rawModifiers = Array.isArray(set.modifiers)
      ? set.modifiers
      : Object.values(set.modifiers);
  }

  const preselectOverrides = overrides.preselect || {};

  const effectiveModifiers = rawModifiers
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((mod) => {
      const isInStock = mod.inStock !== false;
      const hasPreselectOverride = preselectOverrides[mod.id] !== undefined;
      const isPreselected = hasPreselectOverride
        ? Boolean(preselectOverrides[mod.id])
        : Boolean(mod.preselect);

      return {
        ...mod,
        inStock: isInStock,
        // If out of stock, never preselect
        preselect: isInStock ? isPreselected : false,
      };
    });

  // Sort sold out to the end if sortSoldOutLast is enabled
  if (effectiveDisplay.sortSoldOutLast) {
    effectiveModifiers.sort((a, b) => {
      if (a.inStock === b.inStock) return (a.order ?? 0) - (b.order ?? 0);
      return a.inStock ? -1 : 1;
    });
  }

  return {
    id: set.id,
    name: set.name,
    displayName: set.displayName || set.name,
    type: set.type || "list",
    selectionRules: effectiveRules,
    displaySettings: effectiveDisplay,
    textSettings: set.textSettings || { charLimit: 150, required: false },
    modifiers: effectiveModifiers,
  };
}

/**
 * Validate customer selection against modifier set rules.
 * @param {Array<object>} sets - List of effective modifier sets
 * @param {object} selection - Map of { [setId]: { [modId]: boolean } }
 * @param {object} textValues - Map of { [setId]: string }
 * @returns {object} { isValid: boolean, errors: { [setId]: string }, firstErrorSetId: string|null }
 */
export function validateSelection(sets = [], selection = {}, textValues = {}) {
  const errors = {};
  let firstErrorSetId = null;

  (sets || []).forEach((set) => {
    if (!set) return;

    if (set.type === "text") {
      const isRequired = Boolean(set.textSettings?.required);
      const val = (textValues[set.id] || "").trim();
      const limit = Number(set.textSettings?.charLimit) || 150;

      if (isRequired && !val) {
        errors[set.id] = "This instruction is required.";
        if (!firstErrorSetId) firstErrorSetId = set.id;
      } else if (val.length > limit) {
        errors[set.id] = `Must not exceed ${limit} characters.`;
        if (!firstErrorSetId) firstErrorSetId = set.id;
      }
      return;
    }

    // List modifier
    const rules = set.selectionRules || {};
    const setSelection = selection[set.id] || {};
    // Only count options that are inStock
    const validModIds = new Set(
      (set.modifiers || []).filter((m) => m.inStock).map((m) => m.id)
    );

    const selectedCount = Object.keys(setSelection).filter(
      (modId) => setSelection[modId] && validModIds.has(modId)
    ).length;

    if (rules.required && selectedCount === 0) {
      errors[set.id] = rules.allowMultiple
        ? "Choose at least one option"
        : "Choose one option";
      if (!firstErrorSetId) firstErrorSetId = set.id;
    } else if (rules.min && selectedCount < rules.min) {
      errors[set.id] = `Please select at least ${rules.min} option${rules.min > 1 ? "s" : ""}.`;
      if (!firstErrorSetId) firstErrorSetId = set.id;
    } else if (rules.max && selectedCount > rules.max) {
      errors[set.id] = `Maximum ${rules.max} option${rules.max > 1 ? "s" : ""} allowed.`;
      if (!firstErrorSetId) firstErrorSetId = set.id;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    firstErrorSetId,
  };
}
