import test from "node:test";
import assert from "node:assert/strict";
import { normalizeItemModifierSetsMap, getEffectiveSettings } from "../../../shared/modifiers.js";
import { itemToFormState } from "../dashboardViews.js";

test("normalizeItemModifierSetsMap normalizes different data representations", () => {
  // 1. null / undefined / empty
  assert.deepEqual(normalizeItemModifierSetsMap(null), {});
  assert.deepEqual(normalizeItemModifierSetsMap(undefined), {});
  assert.deepEqual(normalizeItemModifierSetsMap({}), {});

  // 2. Array of IDs (e.g. from RTDB or simple list)
  const arrayIds = ["set-sauce", "set-size"];
  const normalizedFromIds = normalizeItemModifierSetsMap(arrayIds);
  assert.deepEqual(normalizedFromIds, {
    "set-sauce": { order: 0, overrides: null },
    "set-size": { order: 1, overrides: null },
  });

  // 3. Array of objects
  const arrayObjects = [
    { id: "set-topping", order: 2, overrides: { selectionRules: { required: true } } },
    { setId: "set-drink", order: 3 },
  ];
  const normalizedFromObjects = normalizeItemModifierSetsMap(arrayObjects);
  assert.deepEqual(normalizedFromObjects, {
    "set-topping": { order: 2, overrides: { selectionRules: { required: true } } },
    "set-drink": { order: 3, overrides: null },
  });

  // 4. Object map (standard RTDB format)
  const objectMap = {
    "set-crust": { order: 1, overrides: null },
  };
  assert.deepEqual(normalizeItemModifierSetsMap(objectMap), objectMap);
});

test("itemToFormState extracts and normalizes modifierSets into formModifierSetsMap", () => {
  const itemWithArrayMods = {
    id: "item-pizza",
    name: "Pizza",
    price: "$15.00",
    modifierSets: ["set-crust", "set-cheese"],
  };

  const formState = itemToFormState(itemWithArrayMods);
  assert.deepEqual(formState.formModifierSetsMap, {
    "set-crust": { order: 0, overrides: null },
    "set-cheese": { order: 1, overrides: null },
  });
  assert.equal(formState.formName, "Pizza");
  assert.equal(formState.formPrice, "15.00");
});

test("getEffectiveSettings works with normalized modifier set", () => {
  const catalogSet = {
    id: "set-crust",
    name: "Crust Choice",
    type: "list",
    selectionRules: { required: false, allowMultiple: false },
    modifiers: {
      "mod-thin": { id: "mod-thin", name: "Thin Crust", inStock: true, order: 0 },
      "mod-thick": { id: "mod-thick", name: "Thick Crust", inStock: true, order: 1 },
    },
  };

  const override = {
    selectionRules: { required: true },
  };

  const effective = getEffectiveSettings(catalogSet, override);
  assert.equal(effective.id, "set-crust");
  assert.equal(effective.selectionRules.required, true);
  assert.equal(effective.modifiers.length, 2);
  assert.equal(effective.modifiers[0].name, "Thin Crust");
});
