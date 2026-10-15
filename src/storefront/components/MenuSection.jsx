import React from 'react';
import ItemCard from './ItemCard';

/**
 * MenuSection - Section for a single category, displaying category header and item cards grid.
 */
export default function MenuSection({ category, items = [], discounts = [], locationId, onSelectItem }) {
  if (!items || items.length === 0) return null;

  return (
    <section 
      id={`category-${category.id}`} 
      className="sf-menu-section"
      data-category-id={category.id}
    >
      <div className="sf-menu-section__header">
        <h2 className="sf-menu-section__title">{category.name}</h2>
      </div>

      <div className="sf-menu-section__grid">
        {items.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            discounts={discounts}
            locationId={locationId}
            onSelect={onSelectItem}
          />
        ))}
      </div>
    </section>
  );
}
