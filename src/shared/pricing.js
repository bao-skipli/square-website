

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

export function applyDiscount(baseCents, discount) {
  if (!discount || typeof baseCents !== "number") return baseCents;

  const safeBase = Math.max(0, Math.round(baseCents));
  let discountAmount = 0;

  if (discount.type === "percent") {

    discountAmount = Math.round((safeBase * Number(discount.value || 0)) / 100);
  } else if (discount.type === "amount") {

    discountAmount = Math.round(Number(discount.value || 0));
  }

  return Math.max(0, safeBase - discountAmount);
}

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

