import React, { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext(null);

function getCartStorageKey(slug) {
  return `sq_cart_${slug || "default"}`;
}

function loadInitialCart(slug) {
  try {
    const raw = localStorage.getItem(getCartStorageKey(slug));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Could not read cart from localStorage:", e);
  }
  return [];
}

function saveCartToStorage(slug, items) {
  try {
    localStorage.setItem(getCartStorageKey(slug), JSON.stringify(items));
  } catch (e) {
    console.warn("Could not save cart to localStorage:", e);
  }
}

function areLinesIdentical(a, b) {
  if (a.itemId !== b.itemId) return false;
  if ((a.variation?.id || null) !== (b.variation?.id || null)) return false;

  const aMods = (a.selectedModifiers || [])
    .map((m) => `${m.setId}_${m.modId}`)
    .sort()
    .join(",");
  const bMods = (b.selectedModifiers || [])
    .map((m) => `${m.setId}_${m.modId}`)
    .sort()
    .join(",");
  if (aMods !== bMods) return false;

  const aText = (a.textValues || [])
    .map((t) => `${t.setId}_${t.value}`)
    .sort()
    .join(",");
  const bText = (b.textValues || [])
    .map((t) => `${t.setId}_${t.value}`)
    .sort()
    .join(",");
  if (aText !== bText) return false;

  return true;
}

function cartReducer(state, action) {
  switch (action.type) {
    case "SET_CART":
      return action.payload || [];

    case "ADD_ITEM": {
      const newLine = action.payload;
      const existingIndex = state.findIndex((line) => areLinesIdentical(line, newLine));

      if (existingIndex > -1) {
        const updated = [...state];
        const existing = updated[existingIndex];
        const newQty = existing.qty + newLine.qty;
        const unitTotal = Math.round(existing.lineTotalCents / existing.qty);
        const unitOriginal = Math.round(existing.lineOriginalCents / existing.qty);

        updated[existingIndex] = {
          ...existing,
          qty: newQty,
          lineTotalCents: unitTotal * newQty,
          lineOriginalCents: unitOriginal * newQty,
        };
        return updated;
      }

      return [newLine, ...state];
    }

    case "UPDATE_QTY": {
      const { lineId, qty } = action.payload;
      if (qty <= 0) {
        return state.filter((line) => line.lineId !== lineId);
      }
      return state.map((line) => {
        if (line.lineId !== lineId) return line;
        const unitTotal = Math.round(line.lineTotalCents / line.qty);
        const unitOriginal = Math.round(line.lineOriginalCents / line.qty);
        return {
          ...line,
          qty,
          lineTotalCents: unitTotal * qty,
          lineOriginalCents: unitOriginal * qty,
        };
      });
    }

    case "REMOVE_ITEM":
      return state.filter((line) => line.lineId !== action.payload);

    case "CLEAR_CART":
      return [];

    default:
      return state;
  }
}

export function CartProvider({ slug, children }) {
  const [items, dispatch] = useReducer(cartReducer, slug, loadInitialCart);

  useEffect(() => {
    saveCartToStorage(slug, items);
  }, [slug, items]);

  useEffect(() => {
    dispatch({ type: "SET_CART", payload: loadInitialCart(slug) });
  }, [slug]);

  const addItem = (lineItem) => {
    const lineId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    dispatch({
      type: "ADD_ITEM",
      payload: {
        ...lineItem,
        lineId,
      },
    });
  };

  const updateQty = (lineId, qty) => {
    dispatch({ type: "UPDATE_QTY", payload: { lineId, qty } });
  };

  const removeItem = (lineId) => {
    dispatch({ type: "REMOVE_ITEM", payload: lineId });
  };

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" });
  };

  const totalCount = items.reduce((sum, item) => sum + (item.qty || 0), 0);
  const subtotalCents = items.reduce((sum, item) => sum + (item.lineTotalCents || 0), 0);

  const value = {
    items,
    totalCount,
    subtotalCents,
    addItem,
    updateQty,
    removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
