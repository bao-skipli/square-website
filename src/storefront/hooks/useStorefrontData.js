import { useState, useEffect, useCallback } from "react";
import { subscribeStorefrontData } from "../services/storefrontService";

export function useStorefrontData(slug) {
  const [data, setData] = useState({
    status: "loading",
    loaded: {
      store: false,
      categories: false,
      items: false,
      modifierSets: false,
      discounts: false,
    },
    store: null,
    categories: [],
    items: [],
    modifierSets: [],
    discounts: [],
    error: null,
  });

  const [reloadTrigger, setReloadTrigger] = useState(0);

  const retry = useCallback(() => {
    setData((prev) => ({
      ...prev,
      status: "loading",
      error: null,
    }));
    setReloadTrigger((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!slug) {
      setData((prev) => ({ ...prev, status: "notFound" }));
      return;
    }

    const unsub = subscribeStorefrontData(slug, (update) => {
      setData((prev) => ({
        ...prev,
        ...update,
      }));
    });

    return () => {
      if (unsub) unsub();
    };
  }, [slug, reloadTrigger]);

  return {
    ...data,
    retry,
  };
}

export default useStorefrontData;

