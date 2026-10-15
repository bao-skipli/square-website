/**
 * Pricing utilities for Storefront and Square Admin
 * All monetary calculations use integer cents.
 */

/**
 * Format cents into a display money string.
 * @param {number} cents - Amount in cents
 * @param {object} [options]
 * @param {boolean} [options.isModifier] - If true, outputs '+ $0' or '+ $0.50'
 * @param {boolean} [options.showZeroCents] - If false and cents % 100 === 0, returns e.g. '$5' instead of '$5.00'
 * @returns {string} Formatted money string
 */
export function formatMoney(cents, options = {}) {
  const safeCents = Math.max(0, Math.round(Number(cents) || 0));

  if (options.isModifier) {
    if (safeCents === 0) return "+ $0";
    return `+ $${(safeCents / 100).toFixed(2)}`;
  }

  if (options.showZeroCents === false && safeCents % 100 === 0) {
    return `$${safeCents / 100}`;
  }

  return `$${(safeCents / 100).toFixed(2)}`;
}

/**
 * Apply a single discount to an item base price in cents.
 * Discount only applies to the base price of the item, NOT to modifiers.
 * @param {number} baseCents - Original base price in cents
 * @param {object} discount - Discount object: { type: 'percent'|'amount', value: number }
 * @returns {number} Discounted base price in cents
 */
export function applyDiscount(baseCents, discount) {
  if (!discount || typeof baseCents !== "number") return baseCents;

  const safeBase = Math.max(0, Math.round(baseCents));
  let discountAmount = 0;

  if (discount.type === "percent") {
    // e.g. 10% of 50 cents = 5 cents -> 45 cents
    discountAmount = Math.round((safeBase * Number(discount.value || 0)) / 100);
  } else if (discount.type === "amount") {
    // fixed cents reduction
    discountAmount = Math.round(Number(discount.value || 0));
  }

  return Math.max(0, safeBase - discountAmount);
}

/**
 * Find the best active discount for an item (max savings, no stacking).
 * @param {number} baseCents - Original base price in cents
 * @param {Array<object>} discounts - List of discount objects
 * @param {string} itemId - Item ID
 * @returns {object|null} The discount giving maximum savings or null
 */
export function findBestDiscount(baseOrItem, discounts = [], itemIdArg = null) {
  if (!Array.isArray(discounts) || discounts.length === 0) return null;

  let baseCents = 0;
  let itemId = itemIdArg;

  if (typeof baseOrItem === "object" && baseOrItem !== null) {
    itemId = baseOrItem.id || itemIdArg;
    baseCents = parsePriceToCents(baseOrItem.priceCents ?? baseOrItem.price ?? 0);
  } else {
    baseCents = Math.max(0, Math.round(Number(baseOrItem) || 0));
  }

  if (!baseCents) return null;

  let bestDiscount = null;
  let maxSavings = 0;

  discounts.forEach((disc) => {
    if (!disc || !disc.active) return;

    // Check appliesTo
    const applies =
      disc.appliesTo === "all" ||
      (disc.appliesTo && typeof disc.appliesTo === "object" && Boolean(disc.appliesTo[itemId]));

    if (!applies) return;

    const discounted = applyDiscount(baseCents, disc);
    const savings = baseCents - discounted;

    if (savings > maxSavings) {
      maxSavings = savings;
      bestDiscount = {
        ...disc,
        badgeText: disc.name || (disc.type === "percent" ? `${disc.value}% OFF` : `-$${(disc.value / 100).toFixed(2)}`),
      };
    }
  });

  return bestDiscount;
}

/**
 * Calculate total price for an order line item.
 * lineTotal = (discountedBase + sum(modifiers)) * qty
 * lineOriginal = (baseCents + sum(modifiers)) * qty
 * @param {object} params
 * @param {number} params.baseCents - Base unit price
 * @param {Array<object>} [params.modifiers] - Selected modifiers with priceCents
 * @param {object} [params.discount] - Applied discount object
 * @param {number} [params.qty] - Quantity
 * @returns {object} Calculated price breakdown
 */
export function calcLineTotal({ baseCents = 0, modifiers = [], discount = null, qty = 1 }) {
  const safeQty = Math.max(1, Math.min(99, Math.round(Number(qty) || 1)));
  const safeBase = Math.max(0, Math.round(Number(baseCents) || 0));

  const modifiersTotal = (modifiers || []).reduce((sum, mod) => {
    return sum + Math.max(0, Math.round(Number(mod?.priceCents) || 0));
  }, 0);

  const discountedBase = discount ? applyDiscount(safeBase, discount) : safeBase;

  const unitTotal = discountedBase + modifiersTotal;
  const unitOriginal = safeBase + modifiersTotal;

  const lineTotal = unitTotal * safeQty;
  const lineOriginal = unitOriginal * safeQty;

  return {
    baseCents: safeBase,
    discountedBase,
    modifiersTotal,
    unitTotal,
    unitOriginal,
    lineTotal,
    lineOriginal,
    qty: safeQty,
    hasDiscount: discountedBase < safeBase,
  };
}

/**
 * Safely parse a dollar string (e.g. "$6.00", "14.50") or integer cents into integer cents.
 * @param {string|number} price
 * @returns {number} Cents as integer
 */
export function parsePriceToCents(price) {
  if (typeof price === "number") {
    if (Number.isInteger(price)) return Math.max(0, price);
    return Math.max(0, Math.round(price * 100));
  }
  if (!price || typeof price !== "string") return 0;

  const clean = price.replace(/[^0-9.-]/g, "");
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.round(num * 100));
}

