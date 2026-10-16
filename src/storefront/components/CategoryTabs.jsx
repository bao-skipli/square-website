import React, { useRef, useEffect } from 'react';

export default function CategoryTabs({ categories = [], activeCategoryId, onSelectCategory }) {
  const scrollContainerRef = useRef(null);
  const activeTabRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeCategoryId]);

  const handleMouseDown = (e) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
  };

  if (!categories || categories.length === 0) return null;

  return (
    <nav
      className="sf-category-tabs-wrapper"
      aria-label="Category navigation"
    >
      <div
        className="sf-category-tabs-container"
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        role="tablist"
      >
        {categories.map((cat) => {
          const isActive = String(cat.id) === String(activeCategoryId);
          return (
            <button
              key={cat.id}
              ref={isActive ? activeTabRef : null}
              role="tab"
              aria-selected={isActive}
              className={`sf-category-tab ${isActive ? 'sf-category-tab--active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <span className="sf-category-tab__label">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
