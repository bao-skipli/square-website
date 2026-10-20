import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import useStorefrontData from './hooks/useStorefrontData';
import { CartProvider } from './context/CartContext';
import StoreHeader from './components/StoreHeader';
import CategoryTabs from './components/CategoryTabs';
import MenuSection from './components/MenuSection';
import ItemDetailModal from './components/ItemDetailModal';
import { HeaderSkeleton, CategoryTabsSkeleton, MenuSkeleton } from './components/skeletons';
import { getThemeColorTokens } from '@/shared/themeTokens';
import './styles/Storefront.css';




function StorefrontContent({ customHostname }) {
  const { slug } = useParams();
  const effectiveIdentifier = customHostname || slug;
  const {
    status,
    loaded,
    store,
    categories,
    items,
    modifierSets,
    discounts,
    retry,
  } = useStorefrontData(effectiveIdentifier);

  const themeStyles = useMemo(() => {
    return getThemeColorTokens(store?.themeColor || '#E53E3E');
  }, [store?.themeColor]);

  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const visibleCategoriesWithItems = useMemo(() => {
    if (!categories || categories.length === 0 || !items) return [];

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

  useEffect(() => {
    if (visibleCategoriesWithItems.length > 0 && !activeCategoryId) {
      setActiveCategoryId(visibleCategoriesWithItems[0].id);
    }
  }, [visibleCategoriesWithItems, activeCategoryId]);

  useEffect(() => {
    if (!loaded.items || visibleCategoriesWithItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isProgrammaticScrollRef.current) return;

        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {

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

  useEffect(() => {
    if (selectedItem && items) {
      const updated = items.find((i) => i.id === selectedItem.id);
      if (updated) {
        setSelectedItem(updated);
      }
    }
  }, [items, selectedItem]);

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
    <div className="sf-page-root" style={themeStyles}>
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

      {!loaded.categories ? (
        <CategoryTabsSkeleton />
      ) : (
        <CategoryTabs
          categories={visibleCategoriesWithItems}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      )}

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

export default function StorefrontPage({ customHostname }) {
  const { slug } = useParams();
  const effectiveSlug = customHostname || slug;

  return (
    <CartProvider storeSlug={effectiveSlug}>
      <StorefrontContent customHostname={customHostname} />
    </CartProvider>
  );
}
