import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { getEffectiveSettings, validateSelection } from '../../shared/modifiers';
import {
  parsePriceToCents,
  formatMoney,
  findBestDiscount,
  applyDiscount,
  calcLineTotal,
} from '../../shared/pricing';
import { CloseIcon, PlusSmallIcon, MinusSmallIcon } from './StorefrontIcons';
import { ImageSkeleton } from './skeletons';

export default function ItemDetailModal({
  item,
  modifierSets = {},
  discounts = [],
  locationId,
  onClose,
}) {
  const { addItem } = useCart();
  const modalRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const setRefs = useRef({});

  const variations = useMemo(() => {
    if (!item?.variations) return [];
    if (Array.isArray(item.variations)) return item.variations;
    return Object.values(item.variations);
  }, [item]);

  const [selectedVariationId, setSelectedVariationId] = useState(() => {
    if (variations.length > 0) {
      return variations[0].id || variations[0].name;
    }
    return null;
  });

  const selectedVariation = useMemo(() => {
    if (variations.length === 0) return null;
    return variations.find((v) => (v.id || v.name) === selectedVariationId) || variations[0];
  }, [variations, selectedVariationId]);

  const basePriceCents = useMemo(() => {
    if (selectedVariation) {
      return parsePriceToCents(selectedVariation.priceCents ?? selectedVariation.price ?? 0);
    }
    return parsePriceToCents(item?.priceCents ?? item?.price ?? 0);
  }, [selectedVariation, item]);

  const activeDiscount = useMemo(() => {
    return findBestDiscount(basePriceCents, discounts, item?.id);
  }, [basePriceCents, discounts, item?.id]);

  const effectiveSets = useMemo(() => {
    if (!item || !modifierSets) return [];

    const setsMap = {};
    if (Array.isArray(modifierSets)) {
      modifierSets.forEach((s) => {
        if (s && s.id) setsMap[s.id] = s;
      });
    } else if (typeof modifierSets === 'object') {
      Object.entries(modifierSets).forEach(([key, val]) => {
        if (val) setsMap[val.id || key] = val;
      });
    }

    let itemModEntries = [];
    if (item.modifierSets) {
      if (Array.isArray(item.modifierSets)) {
        itemModEntries = item.modifierSets.map((entry, idx) => {
          if (typeof entry === 'string') {
            return { setId: entry, order: idx, overrides: null };
          }
          return {
            setId: entry?.id || entry?.setId || String(idx),
            order: entry?.order ?? idx,
            overrides: entry?.overrides || null,
          };
        });
      } else if (typeof item.modifierSets === 'object') {
        itemModEntries = Object.entries(item.modifierSets).map(([setId, config]) => ({
          setId,
          order: config?.order ?? 999,
          overrides: config?.overrides || null,
        }));
      }
    }

    itemModEntries.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

    const list = [];
    for (const { setId, overrides } of itemModEntries) {
      const rawSet = setsMap[setId];
      if (!rawSet) continue;

      const effective = getEffectiveSettings(rawSet, overrides);
      if (!effective) continue;

      if (effective.type !== 'text' && (!effective.modifiers || effective.modifiers.length === 0)) {
        continue;
      }
      list.push(effective);
    }

    return list;
  }, [item, modifierSets]);


  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [textValues, setTextValues] = useState({});
  const [qty, setQty] = useState(1);
  const [errorSetId, setErrorSetId] = useState(null);
  const [errorMessages, setErrorMessages] = useState({});
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    const initialMods = {};
    const initialTexts = {};

    effectiveSets.forEach((set) => {
      if (set.type === 'text') {
        initialTexts[set.id] = '';
      } else {
        const modMap = {};
        (set.modifiers || []).forEach((mod) => {
          if (mod.inStock && mod.preselect) {
            modMap[mod.id] = true;
          }
        });
        initialMods[set.id] = modMap;
      }
    });

    setSelectedModifiers(initialMods);
    setTextValues(initialTexts);
    setQty(1);
    setErrorSetId(null);
    setErrorMessages({});
  }, [item?.id, effectiveSets]);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSelectModifier = (set, mod) => {
    if (!mod.inStock) return;

    setErrorSetId((prev) => (prev === set.id ? null : prev));
    setErrorMessages((prev) => {
      const next = { ...prev };
      delete next[set.id];
      return next;
    });

    const isMultiple = Boolean(set.selectionRules?.allowMultiple);
    const isRequired = Boolean(set.selectionRules?.required);

    setSelectedModifiers((prev) => {
      const currentSetSelection = { ...(prev[set.id] || {}) };
      const currentlyChecked = Boolean(currentSetSelection[mod.id]);

      if (isMultiple) {

        if (currentlyChecked) {
          delete currentSetSelection[mod.id];
        } else {

          const currentCount = Object.keys(currentSetSelection).length;
          if (set.selectionRules?.max && currentCount >= set.selectionRules.max) {
            return prev;
          }
          currentSetSelection[mod.id] = true;
        }
      } else {

        if (currentlyChecked) {

          if (!isRequired) {
            delete currentSetSelection[mod.id];
          }
        } else {

          return {
            ...prev,
            [set.id]: { [mod.id]: true },
          };
        }
      }

      return {
        ...prev,
        [set.id]: currentSetSelection,
      };
    });
  };

  const handleTextChange = (setId, value, limit) => {
    if (value.length > limit) return;
    setErrorSetId((prev) => (prev === setId ? null : prev));
    setErrorMessages((prev) => {
      const next = { ...prev };
      delete next[setId];
      return next;
    });
    setTextValues((prev) => ({
      ...prev,
      [setId]: value,
    }));
  };

  const selectedModifierObjects = useMemo(() => {
    const list = [];
    effectiveSets.forEach((set) => {
      if (set.type === 'text') return;
      const setSelection = selectedModifiers[set.id] || {};
      (set.modifiers || []).forEach((mod) => {
        if (setSelection[mod.id] && mod.inStock) {
          list.push({
            setId: set.id,
            setName: set.displayName || set.name,
            modId: mod.id,
            name: mod.name,
            priceCents: parsePriceToCents(mod.priceCents ?? mod.price ?? 0),
          });
        }
      });
    });
    return list;
  }, [effectiveSets, selectedModifiers]);

  const lineCalculation = useMemo(() => {
    return calcLineTotal({
      baseCents: basePriceCents,
      modifiers: selectedModifierObjects,
      discount: activeDiscount,
      qty,
    });
  }, [basePriceCents, selectedModifierObjects, activeDiscount, qty]);

  const handleAddToCart = () => {
    const validation = validateSelection(effectiveSets, selectedModifiers, textValues);
    if (!validation.isValid) {
      setErrorSetId(validation.firstErrorSetId);
      setErrorMessages(validation.errors);

      const errorEl = setRefs.current[validation.firstErrorSetId];
      if (errorEl) {
        errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const textSnapshot = [];
    effectiveSets.forEach((set) => {
      if (set.type === 'text') {
        const val = textValues[set.id] || '';
        if (val.trim()) {
          textSnapshot.push({
            setId: set.id,
            label: set.displayName || set.name,
            value: val.trim(),
          });
        }
      }
    });

    const itemSnapshot = {
      lineId: `${item.id}_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      itemId: item.id,
      itemName: item.name,
      variation: selectedVariation
        ? {
          id: selectedVariation.id || selectedVariation.name,
          name: selectedVariation.name,
          priceCents: basePriceCents,
        }
        : null,
      qty,
      baseUnitCents: lineCalculation.baseCents,
      discountedUnitCents: lineCalculation.discountedBase,
      selectedModifiers: selectedModifierObjects,
      textValues: textSnapshot,
      unitTotalCents: lineCalculation.unitTotal,
      unitOriginalCents: lineCalculation.unitOriginal,
      lineTotalCents: lineCalculation.lineTotal,
      lineOriginalCents: lineCalculation.lineOriginal,
      imageUrl: item.imageUrl || item.image || item.photo || null,
    };

    addItem(itemSnapshot);
    onClose();
  };

  if (!item) return null;

  const imageSrc = item.imageUrl || item.image || item.photo;
  const hasImage = Boolean(imageSrc);

  return (
    <div
      className="sf-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sf-item-modal-title"
      ref={modalRef}
    >
      <div className="sf-modal-card">
        <button
          type="button"
          className="sf-modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>

        <div className="sf-modal-body">
          <div className="sf-modal-col-left">
            {hasImage && (
              <>
                <div className="sf-modal-image-wrapper">
                  {!imgLoaded && <ImageSkeleton className="sf-modal-img-skeleton" />}
                  <img
                    src={imageSrc}
                    alt={item.name}
                    className={`sf-modal-img ${imgLoaded ? 'sf-modal-img--loaded' : 'sf-modal-img--hidden'}`}
                    onLoad={() => setImgLoaded(true)}
                  />
                </div>
                <p className="sf-modal-illustration-notice">
                  * Image shown is for illustration purposes only
                </p>
              </>
            )}

            <div className="sf-modal-item-info">
              <div className="sf-modal-title-row">
                <h1 id="sf-item-modal-title" className="sf-modal-item-title">
                  {item.name}
                </h1>
                {activeDiscount && lineCalculation?.hasDiscount && (
                  <span className="sf-badge-discount sf-badge-discount--modal">
                    {activeDiscount.badgeText}
                  </span>
                )}
              </div>


              {item.description && (
                <p className="sf-modal-item-desc">{item.description}</p>
              )}

              {item.calories && (
                <span className="sf-modal-item-calories">{item.calories} Cal.</span>
              )}
            </div>
          </div>

          <div className="sf-modal-col-right" ref={scrollContainerRef}>
            <div className="sf-modal-modifiers-scroll">
              {variations.length > 1 && (
                <div className="sf-mod-set-block">
                  <div className="sf-mod-set-header">
                    <span className="sf-mod-set-title">Choose a size/variation</span>
                    <span className="sf-mod-required-badge">REQUIRED</span>
                  </div>
                  <div className="sf-mod-set-divider" />
                  <div className="sf-mod-sublabel">Choose one option</div>

                  <div className="sf-mod-options-list" role="radiogroup">
                    {variations.map((v) => {
                      const vId = v.id || v.name;
                      const isSelected = selectedVariationId === vId;
                      const priceCents = parsePriceToCents(v.priceCents ?? v.price ?? 0);

                      return (
                        <button
                          key={vId}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          className={`sf-mod-row ${isSelected ? 'sf-mod-row--selected' : ''}`}
                          onClick={() => setSelectedVariationId(vId)}
                        >
                          <div className="sf-mod-indicator-wrapper">
                            <span className="sf-mod-radio-circle">
                              {isSelected && <span className="sf-mod-radio-dot" />}
                            </span>
                          </div>
                          <span className="sf-mod-name">{v.name}</span>
                          <span className="sf-mod-price">{formatMoney(priceCents)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {effectiveSets.map((set) => {
                const isError = errorSetId === set.id;
                const setSelection = selectedModifiers[set.id] || {};

                if (set.type === 'text') {
                  const limit = Number(set.textSettings?.charLimit) || 100;
                  const currentVal = textValues[set.id] || '';
                  const isRequired = Boolean(set.textSettings?.required);

                  return (
                    <div
                      key={set.id}
                      ref={(el) => (setRefs.current[set.id] = el)}
                      className={`sf-mod-set-block ${isError ? 'sf-mod-set-block--error' : ''}`}
                    >
                      <div className="sf-mod-set-header">
                        <span className="sf-mod-set-title">{set.displayName || set.name}</span>
                        <div className="sf-mod-set-header-right">
                          {isRequired && (
                            <span className="sf-mod-required-badge">REQUIRED</span>
                          )}
                          <span className="sf-char-counter">
                            {currentVal.length}/{limit}
                          </span>
                        </div>
                      </div>
                      <div className="sf-mod-set-divider" />

                      <div className="sf-mod-text-wrapper">
                        <textarea
                          className="sf-mod-textarea"
                          rows={3}
                          placeholder="Add Instructions..."
                          maxLength={limit}
                          value={currentVal}
                          onChange={(e) => handleTextChange(set.id, e.target.value, limit)}
                        />
                        <p className="sf-mod-text-disclaimer">
                          Special instruction is not guaranteed and will be fulfilled within the
                          store's capability.
                        </p>
                      </div>

                      {isError && errorMessages[set.id] && (
                        <div className="sf-mod-error-msg">{errorMessages[set.id]}</div>
                      )}
                    </div>
                  );
                }

                const isRequired = Boolean(set.selectionRules?.required);
                const isMultiple = Boolean(set.selectionRules?.allowMultiple);
                const subLabel = isRequired
                  ? isMultiple
                    ? 'Choose at least one option'
                    : 'Choose one option'
                  : null;

                return (
                  <div
                    key={set.id}
                    ref={(el) => (setRefs.current[set.id] = el)}
                    className={`sf-mod-set-block ${isError ? 'sf-mod-set-block--error' : ''}`}
                  >
                    <div className="sf-mod-set-header">
                      <span className="sf-mod-set-title">{set.displayName || set.name}</span>
                      {isRequired && <span className="sf-mod-required-badge">REQUIRED</span>}
                    </div>

                    <div className="sf-mod-set-divider" />

                    {subLabel && <div className="sf-mod-sublabel">{subLabel}</div>}

                    <div
                      className="sf-mod-options-list"
                      role={isMultiple ? 'group' : 'radiogroup'}
                    >
                      {(set.modifiers || []).map((mod) => {
                        const isSelected = Boolean(setSelection[mod.id]);
                        const isSoldOut = !mod.inStock;
                        const modPriceCents = parsePriceToCents(mod.priceCents ?? mod.price ?? 0);

                        return (
                          <button
                            key={mod.id}
                            type="button"
                            role={isMultiple ? 'checkbox' : 'radio'}
                            aria-checked={isSelected}
                            aria-disabled={isSoldOut}
                            disabled={isSoldOut}
                            className={`sf-mod-row ${isSelected ? 'sf-mod-row--selected' : ''} ${isSoldOut ? 'sf-mod-row--soldout' : ''
                              }`}
                            onClick={() => handleSelectModifier(set, mod)}
                          >
                            <div className="sf-mod-indicator-wrapper">
                              {isMultiple ? (
                                <span className="sf-mod-checkbox-square">
                                  {isSelected && <span className="sf-mod-checkbox-dot" />}
                                </span>
                              ) : (
                                <span className="sf-mod-radio-circle">
                                  {isSelected && <span className="sf-mod-radio-dot" />}
                                </span>
                              )}
                            </div>

                            <div className="sf-mod-info">
                              <span className="sf-mod-name">{mod.name}</span>
                              {mod.description && (
                                <span className="sf-mod-description">{mod.description}</span>
                              )}
                            </div>

                            <div className="sf-mod-price-col">
                              {isSoldOut ? (
                                <span className="sf-mod-soldout-label">Sold out</span>
                              ) : (
                                <span className="sf-mod-price">
                                  {formatMoney(modPriceCents, { isModifier: true })}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {isError && errorMessages[set.id] && (
                      <div className="sf-mod-error-msg">{errorMessages[set.id]}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="sf-modal-footer">
              <div className="sf-modal-qty-control" role="group" aria-label="Item quantity">
                <button
                  type="button"
                  className="sf-modal-qty-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Decrease quantity"
                >
                  <MinusSmallIcon />
                </button>
                <span className="sf-modal-qty-val" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  className="sf-modal-qty-btn"
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  disabled={qty >= 99}
                  aria-label="Increase quantity"
                >
                  <PlusSmallIcon />
                </button>
              </div>

              <button
                type="button"
                className="sf-modal-add-btn"
                onClick={handleAddToCart}
              >
                <span className="sf-modal-add-label">Add Item</span>
                <div className="sf-modal-add-prices">
                  {lineCalculation.hasDiscount ? (
                    <>
                      <span className="sf-modal-price-original">
                        {formatMoney(lineCalculation.lineOriginal)}
                      </span>
                      <span className="sf-modal-price-final">
                        {formatMoney(lineCalculation.lineTotal)}
                      </span>
                    </>
                  ) : (
                    <span className="sf-modal-price-final">
                      {formatMoney(lineCalculation.lineTotal)}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
