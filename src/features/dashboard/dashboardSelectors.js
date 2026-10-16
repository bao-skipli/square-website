export function getFilteredItems(items, librarySearchQuery, appliedCategories, appliedStatuses) {
  return items.filter((item) => {

    if (librarySearchQuery.trim()) {
      const q = librarySearchQuery.toLowerCase().trim();
      const matchName = item.name && item.name.toLowerCase().includes(q);
      const matchCat = item.category && item.category.toLowerCase().includes(q);
      if (!matchName && !matchCat) return false;
    }

    if (appliedCategories.length > 0) {
      if (!appliedCategories.includes(item.category)) return false;
    }

    if (appliedStatuses.length > 0) {
      if (!appliedStatuses.includes(item.status)) return false;
    }
    return true;
  });
}

export function getFilteredCategories(categories, categoriesSearchQuery) {
  if (!categoriesSearchQuery.trim()) return categories;
  const q = categoriesSearchQuery.toLowerCase().trim();
  return categories.filter((c) => c.name.toLowerCase().includes(q));
}

export function getItemCountForCategory(categories, items, catName) {
  const currentCat = categories.find(
    (c) => c.name.toLowerCase() === catName.toLowerCase()
  );
  const childNames = currentCat
    ? categories
        .filter((c) => c.parentId === currentCat.id)
        .map((c) => c.name.toLowerCase())
    : [];

  const matched = items.filter((item) => {
    if (!item.category) return false;
    const itemCat = item.category.toLowerCase();
    return itemCat === catName.toLowerCase() || childNames.includes(itemCat);
  });
  return matched.length;
}
