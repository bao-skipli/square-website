import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useStorefrontData from './hooks/useStorefrontData';
import { CartProvider } from './context/CartContext';
import StoreHeader from './components/StoreHeader';
import CategoryTabs from './components/CategoryTabs';
import MenuSection from './components/MenuSection';
import ItemDetailModal from './components/ItemDetailModal';
import {
  HeaderSkeleton,
  CategoryTabsSkeleton,
  MenuSkeleton,
} from './components/skeletons';
import './styles/Storefront.css';

function StorefrontContent() {
  const { slug } = useParams();
  const {
    status,
    loaded,
    store,
    categories,
    items,
    modifierSets,
    discounts,
    retry,
  } = useStorefrontData(slug);

  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  // Filter categories: must be visible on store and have >= 1 item
  const visibleCategoriesWithItems = useMemo(() => {
    if (!categories || categories.length === 0 || !items) return [];

    // Group items by category (support name or id matching)
    const itemsByCat = {};
    items.forEach((item) => {
      const catKey = item.categoryId || item.category;
      if (!catKey) return;
      if (!itemsByCat[catKey]) itemsByCat[catKey] = [];
      itemsByCat[catKey].push(item);
    });

    return categories.filter((cat) => {
      const catItems = itemsByCat[cat.id] || itemsByCat[cat.name] || [];
      return catItems.length > 0;
    });
  }, [categories, items]);

  // Map category ID to its items
  const categoryItemsMap = useMemo(() => {
    if (!items) return {};
    const map = {};
    items.forEach((item) => {
      const catKey = item.categoryId || item.category;
      if (!catKey) return;
      if (!map[catKey]) map[catKey] = [];
      map[catKey].push(item);
    });
    return map;
  }, [items]);

  // Set initial active category once visible categories load
  useEffect(() => {
    if (visibleCategoriesWithItems.length > 0 && !activeCategoryId) {
      setActiveCategoryId(visibleCategoriesWithItems[0].id);
    }
  }, [visibleCategoriesWithItems, activeCategoryId]);

  // IntersectionObserver for Scroll-Spy
  useEffect(() => {
    if (!loaded.items || visibleCategoriesWithItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        // Find intersecting entries
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by top offset to find the uppermost visible section
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
          const currentId = visibleEntries[0].target.getAttribute('data-category-id');
          if (currentId) {
            setActiveCategoryId(currentId);
          }
        }
      },
      {
        // Margin offsets sticky header (64px) + sticky tabs (48px)
        rootMargin: '-120px 0px -60% 0px',
        threshold: [0, 0.2, 0.5],
      }
    );

    visibleCategoriesWithItems.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loaded.items, visibleCategoriesWithItems]);

  // Scroll to category smoothly when clicking a tab
  const handleSelectCategory = useCallback((catId) => {
    setActiveCategoryId(catId);
    isProgrammaticScrollRef.current = true;

    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      isProgrammaticScrollRef.current = false;
    }, 800);

    const targetEl = document.getElementById(`category-${catId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Update selected item in realtime if items list changes
  useEffect(() => {
    if (selectedItem && items) {
      const updated = items.find((i) => i.id === selectedItem.id);
      if (updated) {
        setSelectedItem(updated);
      }
    }
  }, [items, selectedItem]);

  // 1. Not Found Screen
  if (status === 'notFound') {
    return (
      <div className="sf-page-root">
        <div className="sf-state-screen">
          <h1 className="sf-state-title">Store Not Found</h1>
          <p className="sf-state-desc">
            The link you followed doesn't match an active online store. Please verify the URL.
          </p>
        </div>
      </div>
    );
  }

  // 2. Closed Screen
  if (status === 'closed') {
    return (
      <div className="sf-page-root">
        <div className="sf-state-screen">
          <h1 className="sf-state-title">This store is currently closed</h1>
          <p className="sf-state-desc">
            Online ordering is currently unavailable for this store. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // 3. Error Screen
  if (status === 'error') {
    return (
      <div className="sf-page-root">
        <div className="sf-state-screen">
          <h1 className="sf-state-title">Something went wrong</h1>
          <p className="sf-state-desc">
            Unable to load the store information. Please check your network connection and try again.
          </p>
          <button type="button" className="sf-btn-retry" onClick={retry}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-page-root">
      {/* 1. Header (Skeleton until store loaded) */}
      {!loaded.store ? (
        <HeaderSkeleton />
      ) : (
        <StoreHeader
          store={store}
          discounts={discounts}
          categories={visibleCategoriesWithItems}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* 2. Category Tabs (Skeleton until categories loaded) */}
      {!loaded.categories ? (
        <CategoryTabsSkeleton />
      ) : (
        <CategoryTabs
          categories={visibleCategoriesWithItems}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* 3. Main Menu Content */}
      <main className="sf-menu-content-container">
        {!loaded.items ? (
          <MenuSkeleton />
        ) : visibleCategoriesWithItems.length === 0 ? (
          <div className="sf-state-screen" style={{ minHeight: '40vh' }}>
            <p className="sf-state-desc">No items available right now.</p>
          </div>
        ) : (
          visibleCategoriesWithItems.map((cat) => {
            const catItems = categoryItemsMap[cat.id] || categoryItemsMap[cat.name] || [];
            return (
              <MenuSection
                key={cat.id}
                category={cat}
                items={catItems}
                discounts={discounts}
                locationId={store?.locationId}
                onSelectItem={(item) => setSelectedItem(item)}
              />
            );
          })
        )}
      </main>

      {/* 4. Item Detail Modal with Modifiers */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          modifierSets={modifierSets}
          discounts={discounts}
          locationId={store?.locationId}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default function StorefrontPage() {
  const { slug } = useParams();

  return (
    <CartProvider storeSlug={slug}>
      <StorefrontContent />
    </CartProvider>
  );
}
