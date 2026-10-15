import React, { useState } from 'react';
import { parsePriceToCents, formatMoney, findBestDiscount, applyDiscount } from '../../shared/pricing';
import { PlusSmallIcon } from './StorefrontIcons';
import { ImageSkeleton } from './skeletons';

/**
 * Checks if an item is sold out given store's active location.
 */
export function isItemSoldOut(item, locationId) {
  if (!item) return false;
  // Check location-specific status if present
  if (locationId && item.locationStatuses && item.locationStatuses[locationId]) {
    const locStatus = String(item.locationStatuses[locationId]).toLowerCase();
    if (locStatus === 'sold out' || locStatus === 'unavailable' || locStatus === 'sold_out') {
      return true;
    }
    if (locStatus === 'available') {
      return false;
    }
  }

  // Fallback to item global status
  if (item.status) {
    const st = String(item.status).toLowerCase();
    if (st === 'sold out' || st === 'unavailable' || st === 'sold_out') {
      return true;
    }
  }

  return false;
}

/**
 * Extracts base pricing and variation info for display.
 */
export function getItemDisplayPrice(item, discounts = []) {
  if (!item) return { isFrom: false, baseCents: 0, finalCents: 0, discount: null };

  const variations = Array.isArray(item.variations)
    ? item.variations
    : item.variations && typeof item.variations === 'object'
    ? Object.values(item.variations)
    : [];

  let baseCents = 0;
  let isFrom = false;

  if (variations.length > 1) {
    isFrom = true;
    const prices = variations.map((v) => parsePriceToCents(v.priceCents ?? v.price ?? 0));
    baseCents = Math.min(...prices);
  } else if (variations.length === 1) {
    baseCents = parsePriceToCents(variations[0].priceCents ?? variations[0].price ?? 0);
  } else {
    baseCents = parsePriceToCents(item.priceCents ?? item.price ?? 0);
  }

  const bestDiscount = findBestDiscount(item, discounts);
  const discountResult = bestDiscount ? applyDiscount(baseCents, bestDiscount) : null;

  return {
    isFrom,
    baseCents,
    finalCents: discountResult ? discountResult.finalCents : baseCents,
    discount: discountResult,
    rawDiscount: bestDiscount
  };
}

export default function ItemCard({ item, discounts = [], locationId, onSelect }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const soldOut = isItemSoldOut(item, locationId);
  const { isFrom, baseCents, finalCents, discount } = getItemDisplayPrice(item, discounts);

  const handleCardClick = () => {
    if (soldOut) return;
    onSelect?.(item);
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    if (soldOut) return;
    onSelect?.(item);
  };

  const hasImage = Boolean(item.imageUrl || item.image || item.photo);
  const imageSrc = item.imageUrl || item.image || item.photo;

  return (
    <div
      className={`sf-item-card ${soldOut ? 'sf-item-card--soldout' : ''}`}
      onClick={handleCardClick}
      role={soldOut ? 'presentation' : 'button'}
      tabIndex={soldOut ? -1 : 0}
      onKeyDown={(e) => {
        if (!soldOut && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-disabled={soldOut}
    >
      {/* Plus button protruding top-right */}
      {!soldOut && (
        <button
          type="button"
          className="sf-item-card__plus-btn"
          onClick={handlePlusClick}
          aria-label={`Add ${item.name}`}
        >
          <PlusSmallIcon />
        </button>
      )}

      {/* Left content: title, 2-line description, price row */}
      <div className="sf-item-card__content">
        <h3 className="sf-item-card__title">{item.name}</h3>
        {item.description && (
          <p className="sf-item-card__desc" title={item.description}>
            {item.description}
          </p>
        )}

        <div className="sf-item-card__footer">
          {soldOut ? (
            <span className="sf-badge-soldout">SOLD OUT</span>
          ) : (
            <div className="sf-item-card__price-row">
              {discount ? (
                <>
                  <span className="sf-price-original">
                    {isFrom ? 'From ' : ''}
                    {formatMoney(baseCents)}
                  </span>
                  <span className="sf-price-final">
                    {isFrom ? 'From ' : ''}
                    {formatMoney(finalCents)}
                  </span>
                  <span className="sf-badge-discount">{discount.badgeText}</span>
                </>
              ) : (
                <span className="sf-price-final">
                  {isFrom ? 'From ' : ''}
                  {formatMoney(baseCents)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right image box */}
      <div className="sf-item-card__image-wrapper">
        {hasImage && !imgError ? (
          <>
            {!imgLoaded && <ImageSkeleton className="sf-item-card__image-skeleton" />}
            <img
              src={imageSrc}
              alt={item.name}
              className={`sf-item-card__img ${imgLoaded ? 'sf-item-card__img--loaded' : 'sf-item-card__img--hidden'}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="sf-item-card__placeholder-img" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
