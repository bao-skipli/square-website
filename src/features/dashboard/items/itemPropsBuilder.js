export function buildItemDetailsProps(comp) {
  const s = comp.state;
  return {
    editingItemId: s.editingItemId,
    itemModifierSetsMap: s.editingItemId
      ? s.items.find((i) => i.id === s.editingItemId)?.modifierSets || {}
      : {},
    allModifierSets: s.modifierSets || [],
    onApplyItemModifierSets: comp.handleApplyItemModifierSets,
    onRemoveItemModifierSet: comp.handleRemoveItemModifierSet,
    onSaveItemModifierOverrides: comp.handleSaveItemModifierOverrides,
    onReorderItemModifierSets: comp.handleReorderItemModifierSets,
    formItemType: s.formItemType,
    formName: s.formName,
    formError: s.formError,
    onNameChange: (e) => comp.setState({ formName: e.target.value, formError: "" }),
    formKitchenName: s.formKitchenName,
    onKitchenNameChange: (e) => comp.setState({ formKitchenName: e.target.value }),
    formPrice: s.formPrice,
    onPriceChange: (e) => comp.setState({ formPrice: e.target.value }),
    formPriceUnit: s.formPriceUnit,
    onPriceUnitChange: (unit) => comp.setState({ formPriceUnit: unit }),
    formDescription: s.formDescription,
    onDescriptionChange: (e) => comp.setState({ formDescription: e.target.value }),
    nutritionalInfoOpen: s.nutritionalInfoOpen,
    onToggleNutritionalInfo: () =>
      comp.setState((prev) => ({ nutritionalInfoOpen: !prev.nutritionalInfoOpen })),
    businessName: s.businessName,
    formSku: s.formSku,
    onSkuChange: (e) => comp.setState({ formSku: e.target.value }),
    formGtin: s.formGtin,
    onGtinChange: (e) => comp.setState({ formGtin: e.target.value }),
    manageCheckoutOpen: s.manageCheckoutOpen,
    onToggleManageCheckout: () =>
      comp.setState((prev) => ({ manageCheckoutOpen: !prev.manageCheckoutOpen })),
    checkoutBannerVisible: s.checkoutBannerVisible,
    onDismissCheckoutBanner: () => comp.setState({ checkoutBannerVisible: false }),
    formCannotBePurchasedAlone: s.formCannotBePurchasedAlone,
    onToggleCannotBePurchasedAlone: () =>
      comp.setState((prev) => ({ formCannotBePurchasedAlone: !prev.formCannotBePurchasedAlone })),
    formSkipCustomization: s.formSkipCustomization,
    onToggleSkipCustomization: () =>
      comp.setState((prev) => ({ formSkipCustomization: !prev.formSkipCustomization })),
    fulfillOrdersOpen: s.fulfillOrdersOpen,
    onToggleFulfillOrders: () =>
      comp.setState((prev) => ({ fulfillOrdersOpen: !prev.fulfillOrdersOpen })),
    formContainsAlcohol: s.formContainsAlcohol,
    onToggleContainsAlcohol: () =>
      comp.setState((prev) => ({ formContainsAlcohol: !prev.formContainsAlcohol })),
    formShippingWeight: s.formShippingWeight,
    onShippingWeightChange: (e) => comp.setState({ formShippingWeight: e.target.value }),
  };
}

export function buildItemSettingsProps(comp) {
  const s = comp.state;
  return {
    formStatus: s.formStatus,
    statusDropdownOpen: s.statusDropdownOpen,
    onToggleStatusDropdown: () =>
      comp.setState((prev) => ({ statusDropdownOpen: !prev.statusDropdownOpen })),
    onSelectStatus: (status) => comp.setState({ formStatus: status, statusDropdownOpen: false }),
    formCategory: s.formCategory,
    onCategoryChange: (e) => comp.setState({ formCategory: e.target.value }),
    formMenu: s.formMenu,
    onMenuChange: (e) => comp.setState({ formMenu: e.target.value }),
    businessName: s.businessName,
    formPointsOfSale: s.formPointsOfSale,
    onTogglePointsOfSale: () =>
      comp.setState((prev) => ({ formPointsOfSale: !prev.formPointsOfSale })),
  };
}
